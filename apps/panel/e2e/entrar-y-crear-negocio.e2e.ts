import { expect, test } from "@playwright/test";
import { readMagicLink } from "./mailpit";

// Un mail y un nombre únicos por corrida: la base local no se limpia entre tests.
function uniqueUser() {
  const stamp = Date.now();
  return {
    email: `e2e-${stamp}@test.local`,
    business: `Barbería E2E ${stamp}`,
  };
}

test("entra con el link, crea su negocio, ve el panel y sale", async ({
  page,
  request,
}) => {
  const { email, business } = uniqueUser();

  await page.goto("/");
  await expect(page).toHaveURL(/\/ingresar$/);
  await page.getByLabel("Tu mail").fill(email);
  await page.getByRole("button", { name: "Enviarme el link" }).click();
  await expect(
    page.getByRole("heading", { name: "Revisá tu mail" }),
  ).toBeVisible();

  await page.goto(await readMagicLink(request, email));
  await expect(
    page.getByRole("heading", { name: "Creá tu agenda" }),
  ).toBeVisible();

  await page.getByLabel("Nombre del negocio").fill(business);
  await page.getByLabel("Barbería").check({ force: true });
  await expect(page.getByText("Disponible")).toBeVisible();
  await page.getByRole("button", { name: "Crear mi agenda" }).click();

  await expect(page.getByText(business, { exact: true })).toBeVisible();
  await expect(page.getByText("Armá tu agenda")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);

  await page.getByRole("link", { name: "Más" }).click();
  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/ingresar$/);
});

test("un link ya usado avisa que venció y deja pedir otro", async ({
  page,
  request,
}) => {
  const { email } = uniqueUser();
  await page.goto("/ingresar");
  await page.getByLabel("Tu mail").fill(email);
  await page.getByRole("button", { name: "Enviarme el link" }).click();
  const link = await readMagicLink(request, email);

  await page.goto(link);
  await expect(
    page.getByRole("heading", { name: "Creá tu agenda" }),
  ).toBeVisible();
  await page.context().clearCookies();
  await page.evaluate(() => window.localStorage.clear());

  await page.goto(link);
  await expect(
    page.getByRole("heading", { name: "Ese link venció" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Pedir otro link" }),
  ).toBeVisible();
});

test("un link propio tomado sugiere el siguiente libre", async ({
  page,
  request,
}) => {
  const first = uniqueUser();
  const name = `Peluquería Dup ${Date.now()}`;

  for (const email of [first.email, `otro-${first.email}`]) {
    await page.goto("/ingresar");
    await page.getByLabel("Tu mail").fill(email);
    await page.getByRole("button", { name: "Enviarme el link" }).click();
    await page.goto(await readMagicLink(request, email));
    await page.getByLabel("Nombre del negocio").fill(name);
    await page.getByLabel("Estética").check({ force: true });
    if (email === first.email) {
      await expect(page.getByText("Disponible")).toBeVisible();
      await page.getByRole("button", { name: "Crear mi agenda" }).click();
      await expect(page.getByText("Armá tu agenda")).toBeVisible();
      await page.getByRole("link", { name: "Más" }).click();
      await page.getByRole("button", { name: "Salir" }).click();
      await expect(page).toHaveURL(/\/ingresar$/);
    } else {
      await expect(
        page.getByText("Ese link no está disponible."),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^Usar .*-2$/ }),
      ).toBeVisible();
    }
  }
});
