import { expect, test } from "@playwright/test";

test("el botón de Google manda a Supabase y vuelve al callback", async ({ page }) => {
  // No se sale a Google: alcanza con ver que el pedido a Supabase es el correcto.
  await page.route("**/auth/v1/authorize**", (route) =>
    route.fulfill({ status: 200, body: "authorize" }),
  );
  await page.goto("/login");

  await expect(page.getByRole("heading", { level: 1, name: "Entrá a tu agenda" })).toBeVisible();
  await page.getByRole("button", { name: "Entrar con Google" }).click();

  await page.waitForURL("**/auth/v1/authorize**");
  const url = new URL(page.url());
  expect(url.searchParams.get("provider")).toBe("google");
  expect(url.searchParams.get("redirect_to")).toBe("http://localhost:3100/auth/callback");
});

test("si Google volvió con error, avisa y deja probar de nuevo", async ({ page }) => {
  await page.goto("/login?error=callback");

  await expect(page.getByRole("main").getByRole("alert")).toContainText("No pudimos terminar de entrar");
  await expect(page.getByRole("button", { name: "Entrar con Google" })).toBeEnabled();
});

test("si no se pudo abrir Google, lo dice", async ({ page }) => {
  await page.goto("/login?error=oauth");

  await expect(page.getByRole("main").getByRole("alert")).toContainText("No pudimos abrir Google");
});

test("sin error no muestra ningún aviso", async ({ page }) => {
  await page.goto("/login?error=cualquiera");

  await expect(page.getByRole("button", { name: "Entrar con Google" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});
