import { expect, type Page, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Solista = Awaited<ReturnType<typeof signUpNewUser>>;

// Los textos de la pantalla se buscan dentro de su región: getByRole ignora lo oculto, y por un
// instante después del load React deja el tramo oculto del streaming (#S:n) junto al contenido ya
// visible, así que un getByText o un locator suelto de la página encuentra lo mismo dos veces.
const vacio = (page: Page) => page.getByRole("region").getByText(/No hay turnos este día/);

async function negocioConCorte(solista: Solista) {
  const { error } = await solista.rpc("create_business", {
    name: `Agenda ${sufijo()}`,
    slug: `agenda-${sufijo()}`,
  });
  expect(error).toBeNull();
  const { data: negocio } = await solista.from("businesses").select("id").single();
  const { data: servicio, error: errorServicio } = await solista.rpc("save_service", {
    business_id: negocio?.id,
    service_id: null,
    name: "Corte",
    duration_minutes: 30,
    price_cents: 1_500_000,
  });
  expect(errorServicio).toBeNull();
  return { businessId: negocio?.id as string, serviceId: servicio as string };
}

// Agenda por la RPC, como lo haría el formulario. La hora va con el desfase de Buenos Aires.
async function agendar(solista: Solista, ids: { businessId: string; serviceId: string }, cliente: string, hora: string) {
  const { error } = await solista.rpc("create_appointment", {
    business_id: ids.businessId,
    service_id: ids.serviceId,
    client_name: cliente,
    client_phone: null as unknown as string,
    starts_at: `2027-03-01T${hora}-03:00`,
  });
  expect(error).toBeNull();
}

test("un día sin turnos lo dice", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);

  await page.goto("/panel/agenda?dia=2027-03-01");

  await expect(page.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
  await expect(vacio(page)).toBeVisible();
});

test("muestra los turnos y bloqueos del día por hora, en hora de Buenos Aires", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await agendar(solista, ids, "Mateo", "09:00:00");
  const { error } = await solista.rpc("block_time", {
    business_id: ids.businessId,
    starts_at: "2027-03-01T12:00:00-03:00",
    minutes: 30,
  });
  expect(error).toBeNull();

  await page.goto("/panel/agenda?dia=2027-03-01");

  await expect(page.getByRole("list", { name: "Turnos del día" }).getByRole("listitem")).toHaveText([
    "09:00–09:30 Mateo Corte",
    "10:00–10:30 Lucía Corte",
    "12:00–12:30 Bloqueado",
  ]);

  // La altura va con el tiempo: una hora entre un turno y el otro son 96 px (1,6 px por minuto).
  const mateo = await page.getByRole("listitem").filter({ hasText: "Mateo" }).boundingBox();
  const lucia = await page.getByRole("listitem").filter({ hasText: "Lucía" }).boundingBox();
  expect((lucia?.y ?? 0) - (mateo?.y ?? 0)).toBeCloseTo(96, 0);
});

test("no muestra los turnos de otro negocio ni los de otro día", async ({ page, context, browser }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");

  const otroContexto = await browser.newContext();
  const otro = await signUpNewUser(otroContexto);
  const otrosIds = await negocioConCorte(otro);
  await agendar(otro, otrosIds, "Ajena", "11:00:00");
  await otroContexto.close();

  await page.goto("/panel/agenda?dia=2027-03-01");
  const turnos = page.getByRole("list", { name: "Turnos del día" }).getByRole("listitem");
  await expect(turnos).toHaveText(["10:00–10:30 Lucía Corte"]);

  await page.goto("/panel/agenda?dia=2027-03-02");
  await expect(vacio(page)).toBeVisible();
});

test("un día inválido en la URL no rompe la pantalla: muestra hoy", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);

  await page.goto("/panel/agenda?dia=basura");

  await expect(page.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
  await expect(vacio(page)).toBeVisible();
});

test("navega entre días con los botones y «Hoy» vuelve a la ruta sin día", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);

  await page.goto("/panel/agenda?dia=2027-03-01");
  await page.getByRole("link", { name: "Día siguiente" }).click();
  await expect(page).toHaveURL(/dia=2027-03-02$/);
  await expect(page.getByRole("heading", { name: /martes 2 de marzo/ })).toBeVisible();

  await page.getByRole("link", { name: "Día anterior" }).click();
  await expect(page).toHaveURL(/dia=2027-03-01$/);
  await page.getByRole("link", { name: "Día anterior" }).click();
  await expect(page).toHaveURL(/dia=2027-02-28$/);

  await page.getByRole("link", { name: "Hoy" }).click();
  await expect(page).toHaveURL(/\/panel\/agenda$/);
  await expect(page.getByRole("link", { name: "Hoy" })).toHaveAttribute("aria-current", "date");
});

test("hoy muestra la línea de ahora; otro día no, y hoy se vuelve a leer cada minuto", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  // Atiende todo el día, así que la hora actual siempre cae dentro de la ventana.
  const { error } = await solista.rpc("set_business_hours", {
    business_id: ids.businessId,
    ranges: Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, start_time: "00:00", end_time: "23:59" })),
  });
  expect(error).toBeNull();

  await page.clock.install();
  await page.goto("/panel/agenda");
  const ahora = page.locator("[data-slot=timeline-now]:visible");
  await expect(ahora).toBeVisible();

  // El temporizador nace al hidratar: se adelanta el reloj hasta que la pantalla vuelve a leerse.
  let recargada = false;
  page.on("request", (request) => {
    recargada ||= request.url().includes("_rsc=");
  });
  await expect
    .poll(async () => {
      await page.clock.fastForward(61_000);
      return recargada;
    })
    .toBe(true);

  await page.goto("/panel/agenda?dia=2027-03-01");
  await expect(page.getByRole("heading", { name: /marzo/ })).toBeVisible();
  await expect(ahora).toHaveCount(0);
});

const DIA = "2027-03-01"; // un lunes

// El formulario del turno: Drawer en celu, Sheet en escritorio.
const formulario = (page: Page) => page.getByRole("dialog");
const turnos = (page: Page) => page.getByRole("list", { name: "Turnos del día" }).getByRole("listitem");

async function agendarDesdeElFormulario(page: Page, cliente: string, hora: string) {
  await page.getByRole("button", { name: "Nuevo turno" }).click();
  await formulario(page).getByText("Corte", { exact: true }).click();
  await formulario(page).getByLabel("Cliente").fill(cliente);
  await formulario(page).getByLabel("Hora").fill(hora);
  await formulario(page).getByRole("button", { name: "Guardar turno" }).click();
}

test("agenda un turno desde el formulario y aparece en la línea", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await agendarDesdeElFormulario(page, "Lucía", "10:00");

  await expect(turnos(page)).toHaveText(["10:00–10:30 Lucía Corte"]);
  await expect(formulario(page)).toHaveCount(0);
});

test("un turno en el mismo horario avisa que se ocupó y deja corregirlo", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await agendarDesdeElFormulario(page, "Mateo", "10:15");

  await expect(formulario(page).getByText("Ese horario se acaba de ocupar. Elegí otro.")).toBeVisible();
  await formulario(page).getByLabel("Hora").fill("10:30");
  await formulario(page).getByRole("button", { name: "Guardar turno" }).click();
  await expect(turnos(page)).toHaveText(["10:00–10:30 Lucía Corte", "10:30–11:00 Mateo Corte"]);
});

test("avisa el almuerzo y el fuera de horario sin frenar el guardado", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  const { error } = await solista.rpc("set_business_hours", {
    business_id: ids.businessId,
    ranges: [
      { weekday: 1, start_time: "09:00", end_time: "13:00" },
      { weekday: 1, start_time: "15:00", end_time: "19:00" },
    ],
  });
  expect(error).toBeNull();
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await page.getByRole("button", { name: "Nuevo turno" }).click();
  await formulario(page).getByText("Corte", { exact: true }).click();
  await formulario(page).getByLabel("Hora").fill("13:30");
  await expect(formulario(page).getByText("Ese horario es tu almuerzo.")).toBeVisible();
  await formulario(page).getByLabel("Hora").fill("20:00");
  await expect(formulario(page).getByText("Ese horario está fuera de tu horario.")).toBeVisible();

  await formulario(page).getByLabel("Cliente").fill("Lucía");
  await formulario(page).getByRole("button", { name: "Guardar turno" }).click();
  await expect(turnos(page).filter({ hasText: "20:00–20:30 Lucía" })).toHaveCount(1);
});

test("sin servicios el formulario manda a cargar uno y no deja guardar", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const { error } = await solista.rpc("create_business", { name: `Vacío ${sufijo()}`, slug: `vacio-${sufijo()}` });
  expect(error).toBeNull();
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await page.getByRole("button", { name: "Nuevo turno" }).click();

  await expect(formulario(page).getByRole("link", { name: "Ir a Servicios" })).toBeVisible();
  await expect(formulario(page).getByRole("button", { name: "Guardar turno" })).toBeDisabled();
});

test("los datos que faltan se avisan campo por campo", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await page.getByRole("button", { name: "Nuevo turno" }).click();
  await formulario(page).getByLabel("Hora").fill("14:47");
  await formulario(page).getByRole("button", { name: "Guardar turno" }).click();

  await expect(formulario(page).getByText("Elegí un servicio.")).toBeVisible();
  await expect(formulario(page).getByText("Poné el nombre del cliente.")).toBeVisible();
  await expect(formulario(page).getByText("Poné la hora de a 5 minutos: 14:45 o 14:50.")).toBeVisible();
});

test("mueve un turno a otra hora y a otro día", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await page.getByRole("button", { name: /Lucía/ }).click();
  await expect(formulario(page).getByRole("heading", { name: "Mover turno" })).toBeVisible();
  await formulario(page).getByLabel("Hora").fill("11:00");
  await formulario(page).getByRole("button", { name: "Mover turno" }).click();
  await expect(turnos(page)).toHaveText(["11:00–11:30 Lucía Corte"]);

  await page.getByRole("button", { name: /Lucía/ }).click();
  await formulario(page).getByLabel("Día").fill("2027-03-02");
  await formulario(page).getByRole("button", { name: "Mover turno" }).click();
  await expect(page).toHaveURL(/dia=2027-03-02$/);
  await expect(turnos(page)).toHaveText(["11:00–11:30 Lucía Corte"]);
});

test("tocar un hueco de la línea abre el formulario con esa hora", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  const { error } = await solista.rpc("set_business_hours", {
    business_id: ids.businessId,
    ranges: [{ weekday: 1, start_time: "09:00", end_time: "18:00" }],
  });
  expect(error).toBeNull();
  await page.goto(`/panel/agenda?dia=${DIA}`);

  // La línea arranca a las 09:00 y mide 96 px por hora: a 96 px del borde es la hora siguiente.
  await page.locator("button[aria-hidden=true][tabindex='-1']:visible").click({ position: { x: 40, y: 96 } });

  await expect(formulario(page).getByLabel("Hora")).toHaveValue("10:00");
  // Un campo de hora de verdad (teclado de horas en el celu), no uno de texto.
  await expect(formulario(page).getByLabel("Hora")).toHaveAttribute("type", "time");
});

test("cancela un turno desde el formulario y lo deshace", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await page.getByRole("button", { name: /Lucía/ }).click();
  await formulario(page).getByRole("button", { name: "Cancelar turno" }).click();

  await expect(page.getByRole("status").getByText("Cancelaste el turno de Lucía.")).toBeVisible();
  await expect(turnos(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(turnos(page)).toHaveText(["10:00–10:30 Lucía Corte"]);
});

test("deshacer avisa si el horario se ocupó mientras tanto", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await page.goto(`/panel/agenda?dia=${DIA}`);
  await page.getByRole("button", { name: /Lucía/ }).click();
  await formulario(page).getByRole("button", { name: "Cancelar turno" }).click();
  await expect(page.getByText("Cancelaste el turno de Lucía.")).toBeVisible();
  await expect(turnos(page)).toHaveCount(0);

  await agendar(solista, ids, "Mateo", "10:00:00");
  await page.getByRole("button", { name: "Deshacer" }).click();

  await expect(page.getByText("Ese horario se ocupó mientras tanto, no se puede deshacer.")).toBeVisible();
});

test("«Salgo 30 min» bloquea desde ahora y se puede deshacer", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);
  await page.goto("/panel/agenda");

  await page.getByRole("button", { name: "Salgo 30 min" }).click();

  await expect(page.getByRole("status").getByText(/Bloqueaste 30 min desde las \d\d:\d\d\./)).toBeVisible();
  await expect(turnos(page)).toHaveText([/Bloqueado/]);

  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(turnos(page)).toHaveCount(0);
});

test("«Salgo 30 min» avisa si pisa un turno y no crea nada", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  const { error } = await solista.rpc("create_appointment", {
    business_id: ids.businessId,
    service_id: ids.serviceId,
    client_name: "Lucía",
    client_phone: null as unknown as string,
    starts_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  });
  expect(error).toBeNull();
  await page.goto("/panel/agenda");

  await page.getByRole("button", { name: "Salgo 30 min" }).click();

  await expect(page.getByText("Tenés un turno en ese horario. Movelo o cancelalo primero.")).toBeVisible();
  await expect(turnos(page)).toHaveText([/Lucía/]);
});

test("«Salgo 30 min» no está en otro día", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);
  await page.goto(`/panel/agenda?dia=${DIA}`);

  await expect(page.getByRole("button", { name: "Nuevo turno" }).first()).toBeAttached();
  await expect(page.getByRole("button", { name: "Salgo 30 min" })).toHaveCount(0);
});

test("tocar un bloqueo en curso deja liberarlo con «Ya volví»", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);
  await page.goto("/panel/agenda");
  await page.getByRole("button", { name: "Salgo 30 min" }).click();
  await expect(page.getByText(/Bloqueaste 30 min/)).toBeVisible();

  await page.getByRole("button", { name: /Bloqueado/ }).click();
  await formulario(page).getByRole("button", { name: "Ya volví" }).click();

  await expect(turnos(page)).toHaveCount(0);
});

test("un bloqueo que todavía no empezó se quita con «Quitar bloqueo»", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  const { error } = await solista.rpc("block_time", {
    business_id: ids.businessId,
    starts_at: new Date(Date.now() + 60 * 60_000).toISOString(),
    minutes: 30,
  });
  expect(error).toBeNull();
  await page.goto("/panel/agenda");

  await page.getByRole("button", { name: /Bloqueado/ }).click();
  await formulario(page).getByRole("button", { name: "Quitar bloqueo" }).click();

  await expect(turnos(page)).toHaveCount(0);
});

test("el aviso de Deshacer se va al abrir un turno nuevo y al cambiar de día", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const ids = await negocioConCorte(solista);
  await agendar(solista, ids, "Lucía", "10:00:00");
  await agendar(solista, ids, "Mateo", "11:00:00");
  await page.goto(`/panel/agenda?dia=${DIA}`);
  await page.getByRole("button", { name: /Lucía/ }).click();
  await formulario(page).getByRole("button", { name: "Cancelar turno" }).click();
  const aviso = page.getByText("Cancelaste el turno de Lucía.");
  await expect(aviso).toBeVisible();

  await page.getByRole("button", { name: "Nuevo turno" }).click();
  await expect(aviso).toHaveCount(0);
  await formulario(page).getByRole("button", { name: "Cancelar", exact: true }).click();

  await page.getByRole("button", { name: /Mateo/ }).click();
  await formulario(page).getByRole("button", { name: "Cancelar turno" }).click();
  await expect(page.getByText("Cancelaste el turno de Mateo.")).toBeVisible();
  await page.getByRole("link", { name: "Día siguiente" }).click();
  await expect(page).toHaveURL(/dia=2027-03-02$/);
  await expect(page.getByText("Cancelaste el turno de Mateo.")).toHaveCount(0);
});
