import type { APIRequestContext, Page } from "@playwright/test";
import { readMagicLink } from "./mailpit";

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const MS_PER_DAY = 86_400_000;

/** Entra con un mail nuevo y crea un negocio: deja la sesión lista en el panel. */
export async function signUpWithBusiness(
  page: Page,
  request: APIRequestContext,
): Promise<string> {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const email = `e2e-${stamp}@test.local`;
  await page.goto("/ingresar");
  await page.getByLabel("Tu mail").fill(email);
  await page.getByRole("button", { name: "Enviarme el link" }).click();
  await page.goto(await readMagicLink(request, email));
  await page.getByLabel("Nombre del negocio").fill(`Barbería E2E ${stamp}`);
  await page.getByLabel("Barbería").check({ force: true });
  await page.getByText("Disponible").waitFor();
  await page.getByRole("button", { name: "Crear mi agenda" }).click();
  await page.getByText("Armá tu agenda").waitFor();
  return email;
}

/** `YYYY-MM-DD` de hoy más `days`, en la zona del negocio. */
export function isoDaysFromToday(days: number): string {
  return new Date(Date.now() + days * MS_PER_DAY).toLocaleDateString("en-CA", {
    timeZone: TIME_ZONE,
  });
}

/** Responde la API de feriados con los que se le pasan (así el test no depende de la red). */
export async function mockHolidays(
  page: Page,
  holidays: { fecha: string; nombre: string }[],
): Promise<void> {
  await page.route("https://api.argentinadatos.com/**", (route) =>
    route.fulfill({
      json: holidays.map((holiday) => ({ ...holiday, tipo: "inamovible" })),
    }),
  );
}
