import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => Date.now().toString(36);

test("el link sale del nombre, avisa que está libre y crea el negocio", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  const id = sufijo();
  await page.goto("/panel/nuevo-negocio");
  const host = new URL(page.url()).host;

  await page.getByLabel("Nombre del negocio").fill(`Barbería Tito ${id}`);
  // Antes de crear el negocio el link se muestra como ruta, sin dominio.
  await expect(page.getByText(`/reservar/barberia-tito-${id}`).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(host)).toHaveCount(0);
  await expect(page.getByText("Disponible")).toBeVisible();
  await page.getByRole("button", { name: "Crear mi negocio" }).click();

  await page.waitForURL("**/panel");
  const { data } = await solista.from("businesses").select("name, slug");
  expect(data).toEqual([{ name: `Barbería Tito ${id}`, slug: `barberia-tito-${id}` }]);
});

test("si el link está ocupado, propone sumarle la zona", async ({ page, context }) => {
  const slug = `ocupado-${sufijo()}`;
  const otro = await signUpNewUser();
  const { error } = await otro.rpc("create_business", { name: "Otro negocio", slug });
  expect(error).toBeNull();

  const solista = await signUpNewUser(context);
  await page.goto("/panel/nuevo-negocio");
  await page.getByLabel("Nombre del negocio").fill(slug.replace("-", " "));

  await expect(page.getByText("Ya lo usa otro negocio")).toBeVisible();
  await page.getByRole("button", { name: "Cambiar link" }).click();
  // La base del link queda fija como prefijo: solo se le suma la zona.
  await expect(page.getByText(`/reservar/${slug}-`)).toBeVisible();
  const link = page.getByLabel("Tu link");
  await expect(link).toHaveValue("");
  await link.pressSequentially("palermo");
  await expect(page.getByText("Disponible")).toBeVisible();
  await page.getByRole("button", { name: "Crear mi negocio" }).click();

  await page.waitForURL("**/panel");
  const { data } = await solista.from("businesses").select("slug");
  expect(data).toEqual([{ slug: `${slug}-palermo` }]);
});

test("un link cambiado a mano con símbolos se marca en el campo", async ({ page, context }) => {
  const slug = `ocupado-${sufijo()}`;
  const otro = await signUpNewUser();
  await otro.rpc("create_business", { name: "Otro negocio", slug });

  await signUpNewUser(context);
  await page.goto("/panel/nuevo-negocio");
  await page.getByLabel("Nombre del negocio").fill(slug.replace("-", " "));
  await page.getByRole("button", { name: "Cambiar link" }).click();
  await page.getByLabel("Tu link").fill("Tito_Uñas");
  await page.getByRole("button", { name: "Crear mi negocio" }).click();

  await expect(page.getByLabel("Tu link")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Usá solo minúsculas, números y guiones")).toBeVisible();
});

test("si el nombre da un link muy corto, se puede arreglar sumándole algo", async ({ page, context }) => {
  const solista = await signUpNewUser(context);
  await page.goto("/panel/nuevo-negocio");
  await page.getByLabel("Nombre del negocio").fill("JB");
  await page.getByRole("button", { name: "Crear mi negocio" }).click();

  await expect(page.getByText("El link necesita al menos 3 caracteres")).toBeVisible();
  await page.getByRole("button", { name: "Cambiar link" }).click();
  await page.getByLabel("Tu link").pressSequentially(`palermo-${sufijo()}`);
  await expect(page.getByText("Disponible")).toBeVisible();
  // El error viejo era de otro link: ya no corresponde.
  await expect(page.getByText("El link necesita al menos 3 caracteres")).toHaveCount(0);
  await page.getByRole("button", { name: "Crear mi negocio" }).click();

  await page.waitForURL("**/panel");
  const { data } = await solista.from("businesses").select("name");
  expect(data).toEqual([{ name: "JB" }]);
});

test("si se corta la red mientras revisa el link, deja de decir que está revisando", async ({ page, context }) => {
  await signUpNewUser(context);
  await page.goto("/panel/nuevo-negocio");
  await page.route("**/panel/nuevo-negocio", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );

  await page.getByLabel("Nombre del negocio").fill(`Sin red ${sufijo()}`);
  await expect(page.getByText("Revisando…")).toHaveCount(0, { timeout: 4000 });
});
