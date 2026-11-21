import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Solista = Awaited<ReturnType<typeof signUpNewUser>>;

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
  await expect(page.getByText(/No hay turnos este día/)).toBeVisible();
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
  await expect(page.getByText(/No hay turnos este día/)).toBeVisible();
});

test("un día inválido en la URL no rompe la pantalla: muestra hoy", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await negocioConCorte(solista);

  await page.goto("/panel/agenda?dia=basura");

  await expect(page.getByRole("heading", { name: "Agenda", level: 1 })).toBeVisible();
  await expect(page.getByText(/No hay turnos este día/)).toBeVisible();
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
  const ahora = page.locator("[data-slot=timeline-now]");
  await expect(ahora).toBeVisible();

  const recarga = page.waitForRequest((request) => request.url().includes("_rsc="));
  await page.clock.fastForward(61_000);
  await recarga;

  await page.goto("/panel/agenda?dia=2027-03-01");
  await expect(page.getByRole("heading", { name: /marzo/ })).toBeVisible();
  await expect(ahora).toHaveCount(0);
});
