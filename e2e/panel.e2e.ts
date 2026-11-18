import { expect, type Page, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => Date.now().toString(36);

test("sin sesión, el panel y crear el negocio mandan a /login", async ({ page }) => {
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/panel/nuevo-negocio");
  await expect(page).toHaveURL(/\/login$/);
});

test("con sesión pero sin negocio, el panel manda a crearlo", async ({ page, context }) => {
  await signUpNewUser(context);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/panel\/nuevo-negocio$/);
});

test("con negocio, el panel muestra su nombre y no deja crear otro", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const nombre = `Barbería ${sufijo()}`;
  const { error } = await solista.rpc("create_business", { name: nombre, slug: `panel-${sufijo()}` });
  expect(error).toBeNull();

  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();

  await page.goto("/panel/nuevo-negocio");
  await expect(page).toHaveURL(/\/panel$/);
});

test("el link de reservas llega en el primer HTML, con el dominio del entorno", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const slug = `html-${sufijo()}`;
  await solista.rpc("create_business", { name: "Primer HTML", slug });

  // Sin hidratar: lo que manda el servidor ya tiene el dominio correcto (no hay flash).
  const respuesta = await page.request.get("/panel");
  // <wbr> es el punto donde puede cortar la línea; no es parte del texto.
  const html = (await respuesta.text()).replaceAll("<wbr/>", "");
  expect(html).toContain(`localhost:3100/reservar/${slug}`);
  expect(html).not.toContain("agenditas.app/reservar");
});

test("con sesión, /login lleva al panel", async ({ page, context }) => {
  await signUpNewUser(context);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/panel/);
});

test("Salir cierra la sesión y el panel vuelve a pedir login", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await solista.rpc("create_business", { name: "Salida", slug: `salida-${sufijo()}` });

  const errores = erroresDeLaPagina(page);

  await page.goto("/panel");
  // En celu el sidebar es un cajón: se abre con el botón del encabezado.
  await page.getByRole("button", { name: "Mostrar u ocultar el menú" }).click();
  await page.getByRole("button", { name: /@test\.local/ }).click();
  await page.getByRole("menuitem", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errores).toEqual([]);

  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login$/);
});

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("el sidebar muestra el negocio y Salir está en el menú de la cuenta", async ({ page, context }) => {
    const solista = await signUpNewUser(context);
    const nombre = `Escritorio ${sufijo()}`;
    const slug = `escritorio-${sufijo()}`;
    await solista.rpc("create_business", { name: nombre, slug });

    const errores = erroresDeLaPagina(page);

    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
    await expect(page.getByText(`${new URL(page.url()).host}/reservar/${slug}`)).toBeVisible();

    await page.getByRole("button", { name: /@test\.local/ }).click();
    await page.getByRole("menuitem", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(errores).toEqual([]);
  });
});

// Errores de JavaScript de la página (por ejemplo, un formulario de React mal enviado).
function erroresDeLaPagina(page: Page): string[] {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  return errores;
}
