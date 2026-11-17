import { expect, test } from "@playwright/test";

test("la portada carga en español con el nombre de la app", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Agenditas" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
});

test("la vitrina de tokens no existe en producción", async ({ page }) => {
  const respuesta = await page.goto("/dev/tokens");

  expect(respuesta?.status()).toBe(404);
});
