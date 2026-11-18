import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => Date.now().toString(36);

async function negocioNuevo(context: Parameters<typeof signUpNewUser>[0]) {
  const solista = await signUpNewUser(context);
  const { error } = await solista.rpc("create_business", {
    name: `Horarios ${sufijo()}`,
    slug: `horarios-${sufijo()}`,
  });
  expect(error).toBeNull();
}

test("sin sesión, /panel/horarios manda a /login", async ({ page }) => {
  await page.goto("/panel/horarios");
  await expect(page).toHaveURL(/\/login$/);
});

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("semana vacía: todo cerrado y sin pie de acciones", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await expect(
      page.getByRole("heading", { name: "Horarios", level: 1 }),
    ).toBeVisible();
    await expect(page.locator("[data-slot=day-closed]")).toHaveCount(7);
    await expect(
      page.getByRole("button", { name: "Guardar horarios" }),
    ).toHaveCount(0);
  });

  test("abrir un día, guardar y que quede al recargar", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await page.getByRole("switch", { name: "Lunes: no atiende" }).click();
    await expect(page.getByRole("status")).toHaveText("Cambios sin guardar");

    await page.getByRole("button", { name: "Guardar horarios" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Listo, guardamos tus horarios.",
    );

    await page.reload();
    await expect(
      page.getByRole("switch", { name: "Lunes: atiende" }),
    ).toBeChecked();
    await expect(page.getByLabel("Lunes, desde")).toHaveValue("09:00");
    await expect(page.getByLabel("Lunes, hasta")).toHaveValue("18:00");
    await expect(
      page.getByRole("button", { name: "Guardar horarios" }),
    ).toHaveCount(0);
  });

  test("marca el día de hoy y muestra las horas de cada día abierto", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await expect(page.locator("[data-slot=day-today]:visible")).toHaveCount(1);
    await expect(page.locator("[data-slot=day-duration]:visible")).toHaveCount(
      0,
    );

    await page.getByRole("switch", { name: "Lunes: no atiende" }).click();
    await expect(page.locator("[data-slot=day-duration]:visible")).toHaveText(
      "9 h",
    );
    await page.getByRole("button", { name: "Almuerzo" }).first().click();
    await expect(page.locator("[data-slot=day-duration]:visible")).toHaveText(
      "8 h",
    );
  });

  test("copiar el horario de un día a lunes a viernes o a toda la semana", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    // Un día cerrado no ofrece copiar.
    await expect(
      page.getByRole("button", { name: /Copiar el horario del lunes/ }),
    ).toHaveCount(0);

    await page.getByRole("switch", { name: "Lunes: no atiende" }).click();
    await page
      .getByRole("button", { name: /Copiar el horario del lunes/ })
      .click();
    await page.getByRole("menuitem", { name: "Lunes a viernes" }).click();

    await expect(
      page.getByRole("switch", { name: "Viernes: atiende" }),
    ).toBeChecked();
    await expect(
      page.getByRole("switch", { name: "Sábado: no atiende" }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveText(
      "Copiamos el horario del lunes a lunes a viernes.",
    );

    // Deshacer vuelve solo la copia: el lunes sigue abierto y el resto, cerrado.
    await page.getByRole("button", { name: "Deshacer" }).click();
    await expect(
      page.getByRole("switch", { name: "Viernes: no atiende" }),
    ).toBeVisible();
    await expect(
      page.getByRole("switch", { name: "Lunes: atiende" }),
    ).toBeChecked();
    await expect(page.getByRole("button", { name: "Deshacer" })).toHaveCount(0);

    await page
      .getByRole("button", { name: /Copiar el horario del lunes/ })
      .click();
    await page.getByRole("menuitem", { name: "Lunes a viernes" }).click();

    await page
      .getByRole("button", { name: /Copiar el horario del martes/ })
      .click();
    await page.getByRole("menuitem", { name: "Toda la semana" }).click();
    await expect(
      page.getByRole("switch", { name: "Domingo: atiende" }),
    ).toBeChecked();
  });

  test("Descartar vuelve a lo guardado y esconde el pie", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await page.getByRole("switch", { name: "Martes: no atiende" }).click();
    await page.getByRole("button", { name: "Descartar" }).click();

    await expect(
      page.getByRole("switch", { name: "Martes: no atiende" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Guardar horarios" }),
    ).toHaveCount(0);
  });

  test("una franja al revés muestra el aviso y no deja guardar", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await page.getByRole("switch", { name: "Lunes: no atiende" }).click();
    await page.getByLabel("Lunes, hasta").fill("08:00");

    await expect(
      page.getByRole("button", { name: "Guardar horarios" }),
    ).toBeDisabled();
    await expect(page.getByLabel("Lunes, hasta")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "El fin tiene que ser después del inicio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Almuerzo" }).first(),
    ).toBeDisabled();
  });

  test("agregar almuerzo parte el día en dos franjas y se guarda", async ({
    page,
    context,
  }) => {
    await negocioNuevo(context);
    await page.goto("/panel/horarios");

    await page.getByRole("switch", { name: "Lunes: no atiende" }).click();
    await page.getByRole("button", { name: "Almuerzo" }).first().click();
    await expect(
      page.getByText(/^almuerzo \d\d:\d\d–\d\d:\d\d$/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Guardar horarios" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Listo, guardamos tus horarios.",
    );
    await page.reload();
    await expect(page.getByText(/^almuerzo /)).toBeVisible();
  });
});

test("celu: se edita un día en la hoja, se aplica a la semana y se guarda", async ({
  page,
  context,
}) => {
  await negocioNuevo(context);
  await page.goto("/panel/horarios");

  await page
    .getByRole("button", { name: "Editar el horario del lunes" })
    .click();
  await expect(
    page.getByRole("button", { name: "Aplicar a Solo este día" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Aplicar a/ }).click();
  await page.getByRole("menuitemradio", { name: "Lunes a viernes" }).click();
  await page.getByRole("button", { name: "Listo" }).click();

  await page.getByRole("button", { name: "Guardar horarios" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Listo, guardamos tus horarios.",
  );

  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Viernes: atiende" }),
  ).toBeChecked();
  await expect(
    page.getByRole("switch", { name: "Sábado: no atiende" }),
  ).not.toBeChecked();
});

test("celu: la hoja puede aplicar el horario a toda la semana", async ({
  page,
  context,
}) => {
  await negocioNuevo(context);
  await page.goto("/panel/horarios");

  await page
    .getByRole("button", { name: "Editar el horario del lunes" })
    .click();
  await page.getByRole("button", { name: /Aplicar a/ }).click();
  await page.getByRole("menuitemradio", { name: "Toda la semana" }).click();
  await page.getByRole("button", { name: "Listo" }).click();

  await expect(
    page.getByRole("switch", { name: "Domingo: atiende" }),
  ).toBeChecked();
});

test("celu: el interruptor de cada día tiene una zona de toque de al menos 44 px", async ({
  page,
  context,
}) => {
  await negocioNuevo(context);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/panel/horarios");

  const interruptor = page
    .locator("[data-slot=day-summary] [data-slot=switch]")
    .first();
  await expect(interruptor).toBeVisible();
  const alto = await interruptor
    // La zona de toque es un ::after que sobresale del interruptor (top y bottom negativos).
    .evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return (
        el.getBoundingClientRect().height -
        Number.parseFloat(after.top) -
        Number.parseFloat(after.bottom)
      );
    });
  expect(alto).toBeGreaterThanOrEqual(44);
});

test("los próximos feriados aparecen bajo la semana, sin alerta de error", async ({
  page,
  context,
}) => {
  await negocioNuevo(context);
  await page.goto("/panel/horarios");

  const feriados = page.getByRole("region", { name: "Próximos feriados" });
  await expect(feriados).toBeVisible();
  // Con feriados cargados hay filas; sin cargar, el aviso de vacío. Nunca el de error: sería
  // un problema de permisos al leer la tabla.
  await expect(
    feriados.getByRole("listitem").first().or(feriados.getByText("Todavía no hay feriados para mostrar.")),
  ).toBeVisible();
  await expect(feriados.getByRole("alert")).toHaveCount(0);
});
