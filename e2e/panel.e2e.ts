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
  // El <main> es el contenido del marco: no puede haber otro adentro.
  await expect(page.locator("main")).toHaveCount(1);

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

test("el título y la bajada de cada pantalla llegan en el primer HTML", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await solista.rpc("create_business", { name: "Primer título", slug: `titulo-${sufijo()}` });

  // Sin hidratar: el encabezado lo dibuja el servidor, no un portal que espera al navegador.
  const servicios = await (await page.request.get("/panel/servicios")).text();
  expect(servicios).toMatch(/<h1[^>]*>Servicios<\/h1>/);
  expect(servicios).toContain("Lo que ofrecés, cuánto dura y cuánto cuesta.");

  const horarios = await (await page.request.get("/panel/horarios")).text();
  expect(horarios).toMatch(/<h1[^>]*>Horarios<\/h1>/);
  expect(horarios).toContain("Prendé los días en que atendés y poné las horas.");
});

test("mientras carga la sesión, el panel manda un esqueleto y no una pantalla en blanco", async ({ page, context }) => {
  await signUpNewUser(context);

  // El fallback del <Suspense> viaja en el HTML inicial, antes de que lleguen la sesión y el negocio.
  const html = await (await page.request.get("/panel")).text();
  expect(html).toContain('data-slot="skeleton"');
  expect(html).toContain("Cargando tu panel");
});

test("sin sesión, el proxy redirige con un 307 antes de renderizar nada", async ({ playwright, baseURL }) => {
  const anonimo = await playwright.request.newContext({ baseURL });
  for (const ruta of ["/panel", "/panel/nuevo-negocio"]) {
    const respuesta = await anonimo.get(ruta, { maxRedirects: 0 });
    expect(respuesta.status(), ruta).toBe(307);
    expect(respuesta.headers().location, ruta).toMatch(/\/login$/);
  }
});

test("con sesión, el proxy manda /login al panel con un 307", async ({ page, context }) => {
  await signUpNewUser(context);
  const respuesta = await page.request.get("/login", { maxRedirects: 0 });
  expect(respuesta.status()).toBe(307);
  expect(respuesta.headers().location).toMatch(/\/panel$/);
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

test("celu: el menú del cajón tiene ítems de 44 px y se cierra al elegir una pantalla", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await solista.rpc("create_business", { name: "Cajón", slug: `cajon-${sufijo()}` });
  await page.goto("/panel");

  await page.getByRole("banner").getByRole("button", { name: "Mostrar u ocultar el menú" }).click();
  const cajon = page.getByRole("dialog");
  const servicios = cajon.getByRole("link", { name: "Servicios" });
  await expect(servicios).toBeVisible();
  expect((await servicios.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

  await servicios.click();
  await expect(page).toHaveURL(/\/panel\/servicios$/);
  await expect(page.getByRole("heading", { name: "Servicios", level: 1 })).toBeVisible();
  await expect(cajon).toHaveCount(0);
});

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("los ítems del menú miden 32 px", async ({ page, context }) => {
    const solista = await signUpNewUser(context);
    await solista.rpc("create_business", { name: "Menú", slug: `menu-${sufijo()}` });
    await page.goto("/panel");

    const horarios = page.getByRole("link", { name: "Horarios", exact: true });
    await expect(horarios).toBeVisible();
    expect((await horarios.boundingBox())?.height).toBe(32);
  });
});
