import { expect, test } from "@playwright/test";
import { isoDaysFromToday, mockHolidays, signUpWithBusiness } from "./session";

test("carga un servicio, elige horarios con almuerzo y ve los pasos completos", async ({
  page,
  request,
}) => {
  await signUpWithBusiness(page, request);

  await page.getByRole("link", { name: "Cargar servicios" }).click();
  await page.getByLabel("Nombre").fill("Corte clásico");
  await page.getByRole("button", { name: "45 min" }).click();
  await page.getByLabel("Precio (opcional)").fill("19500");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.getByRole("heading", { name: "Servicios" })).toBeVisible();
  await expect(page.getByText("45 min · $19.500")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Secciones" })
    .getByRole("link", { name: "Más" })
    .click();
  await page.getByRole("link", { name: "Horarios" }).click();
  await page.getByRole("switch", { name: "Lunes abierto" }).click();
  await page.getByRole("switch", { name: "Lunes con almuerzo" }).click();
  await page.getByRole("button", { name: "Guardar horarios" }).click();
  await expect(page.getByText("Horarios guardados")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Lunes abierto" }),
  ).toBeChecked();
  const monday = page.getByRole("region", { name: "Lunes" });
  await expect(monday.getByLabel("Almuerzo desde")).toHaveValue("13:00");

  await page.getByRole("link", { name: "Agenda" }).click();
  await expect(page.getByText("Cargá tus servicios (listo)")).toBeVisible();
  await expect(page.getByText("Elegí tus horarios (listo)")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Compartir mi link" }),
  ).toBeVisible();
});

test("un nombre repetido avisa y un servicio archivado sale de la lista", async ({
  page,
  request,
}) => {
  await signUpWithBusiness(page, request);

  for (const attempt of ["primero", "segundo"]) {
    await page.goto("/servicios/nuevo");
    await page.getByLabel("Nombre").fill("Corte");
    await page.getByRole("button", { name: "Guardar" }).click();
    if (attempt === "segundo") {
      await expect(
        page.getByText("Ya tenés un servicio con ese nombre."),
      ).toBeVisible();
    }
  }

  await page.goto("/servicios");
  await expect(page.getByText("30 min · Consultar")).toBeVisible();
  await page.getByRole("link", { name: /Corte/ }).click();
  await page.getByRole("button", { name: "Archivar servicio" }).click();
  await expect(
    page.getByRole("group", { name: "Confirmar archivo" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Archivar", exact: true }).click();
  await expect(page.getByText("Cargá tu primer servicio")).toBeVisible();
});

test("un almuerzo fuera del horario avisa antes de guardar", async ({
  page,
  request,
}) => {
  await signUpWithBusiness(page, request);
  await page.goto("/horarios");

  await page.getByRole("switch", { name: "Martes abierto" }).click();
  await page.getByRole("switch", { name: "Martes con almuerzo" }).click();
  const tuesday = page.getByRole("region", { name: "Martes" });
  await tuesday.getByLabel("Almuerzo desde").selectOption("09:00");

  await expect(
    tuesday.getByText("El almuerzo tiene que quedar adentro del horario."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Guardar horarios" }),
  ).toBeDisabled();
});

test("abre un feriado, cierra unas vacaciones y los quita", async ({
  page,
  request,
}) => {
  await mockHolidays(page, [
    { fecha: isoDaysFromToday(10), nombre: "Feriado de prueba" },
  ]);
  await signUpWithBusiness(page, request);
  await page.goto("/dias-cerrados");

  const holiday = page.getByRole("switch", {
    name: "Abro el Feriado de prueba",
  });
  await expect(holiday).not.toBeChecked();
  await holiday.click();
  await expect(holiday).toBeChecked();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Abro el Feriado de prueba" }),
  ).toBeChecked();

  await page.getByRole("button", { name: "Cerrar un día" }).click();
  await expect(page.getByLabel("Desde")).toBeFocused();
  await page.getByLabel("Desde").fill(isoDaysFromToday(20));
  await page.getByLabel("Hasta (opcional)").fill(isoDaysFromToday(22));
  await page.getByLabel("Motivo (opcional)").fill("Vacaciones");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(page.getByText("Vacaciones")).toBeVisible();

  await page.getByRole("button", { name: /^Quitar Vacaciones/ }).click();
  await expect(page.getByText("Todavía no cerraste ningún día.")).toBeVisible();
});

test("si falla la API de feriados avisa y deja cerrar días igual", async ({
  page,
  request,
}) => {
  await page.route("https://api.argentinadatos.com/**", (route) =>
    route.fulfill({ status: 500 }),
  );
  await signUpWithBusiness(page, request);
  await page.goto("/dias-cerrados");

  await expect(
    page.getByText(
      "No pudimos traer los feriados. Podés cerrar días a mano igual.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cerrar un día" }),
  ).toBeVisible();
});
