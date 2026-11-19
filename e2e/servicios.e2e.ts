import { expect, type Page, test } from "@playwright/test";
import { signUpNewUser } from "./support/session";

const sufijo = () => Date.now().toString(36);

async function negocioNuevo(context: Parameters<typeof signUpNewUser>[0]) {
  const solista = await signUpNewUser(context);
  const { error } = await solista.rpc("create_business", {
    name: `Servicios ${sufijo()}`,
    slug: `servicios-${sufijo()}`,
  });
  expect(error).toBeNull();
  return solista;
}

// Carga servicios por la RPC, como lo haría el formulario.
async function cargarServicios(solista: Awaited<ReturnType<typeof negocioNuevo>>, nombres: string[]) {
  const { data: negocio } = await solista.from("businesses").select("id").single();
  for (const name of nombres) {
    const { error } = await solista.rpc("save_service", {
      business_id: negocio?.id,
      service_id: null,
      name,
      duration_minutes: 30,
      price_cents: 1_500_000,
    });
    expect(error).toBeNull();
  }
}

// El formulario abierto: Sheet en escritorio, Drawer en celu.
async function completarFormulario(page: Page, datos: { nombre?: string; duracion?: string; precio?: string }) {
  const formulario = page.getByRole("dialog");
  if (datos.nombre !== undefined) {
    await formulario.getByLabel("Nombre").fill(datos.nombre);
  }
  if (datos.duracion) {
    await formulario.getByText(datos.duracion, { exact: true }).click();
  }
  if (datos.precio !== undefined) {
    await formulario.getByLabel("Precio").fill(datos.precio);
  }
  return formulario;
}

test("sin sesión, /panel/servicios manda a /login", async ({ page }) => {
  await page.goto("/panel/servicios");
  await expect(page).toHaveURL(/\/login$/);
});

test.describe("escritorio", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("sin servicios, el vacío deja cargar el primero y queda en la tabla", async ({ page, context }) => {
    await negocioNuevo(context);
    await page.goto("/panel/servicios");

    await expect(page.getByText("Todavía no cargaste servicios")).toBeVisible();
    await page.getByRole("button", { name: "Cargar el primero" }).click();
    const formulario = await completarFormulario(page, { nombre: "Corte", duracion: "30 min", precio: "1500" });
    await formulario.getByRole("button", { name: "Guardar" }).click();

    await expect(formulario).toBeHidden();
    await expect(page.getByRole("button", { name: "Corte", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "$ 1.500" })).toBeVisible();
    await expect(page.getByText("1 servicio", { exact: true })).toBeVisible();
  });

  test("guardar vacío avisa campo por campo y no cierra el formulario", async ({ page, context }) => {
    await negocioNuevo(context);
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Nuevo servicio" }).click();
    const formulario = page.getByRole("dialog");
    await formulario.getByRole("button", { name: "Guardar" }).click();

    await expect(formulario.getByText("Poné un nombre.")).toBeVisible();
    await expect(formulario.getByText("Elegí cuánto dura.")).toBeVisible();
    await expect(formulario.getByText("Poné el precio así: 1500 o 1.500,50.")).toBeVisible();
  });

  test("un nombre repetido lo rechaza la base y el formulario sigue abierto", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, ["Corte"]);
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Nuevo servicio" }).click();
    const formulario = await completarFormulario(page, { nombre: "corte", duracion: "30 min", precio: "1000" });
    await formulario.getByRole("button", { name: "Guardar" }).click();

    await expect(formulario.getByRole("alert")).toHaveText("Ya tenés un servicio con ese nombre.");
    await expect(formulario).toBeVisible();
  });

  test("editar un servicio y que el cambio quede al recargar", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, ["Corte"]);
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Corte", exact: true }).click();
    const formulario = await completarFormulario(page, { precio: "2000,50" });
    await expect(formulario.getByLabel("Nombre")).toHaveValue("Corte");
    await formulario.getByRole("button", { name: "Guardar" }).click();
    await expect(formulario).toBeHidden();

    await page.reload();
    await expect(page.getByRole("cell", { name: "$ 2.000,50" })).toBeVisible();
  });

  test("borrar avisa y Deshacer lo trae de vuelta", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, ["Corte", "Tintura"]);
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Corte", exact: true }).click();
    await page.getByRole("button", { name: "Borrar servicio" }).click();

    await expect(page.getByRole("status")).toContainText("Borraste Corte.");
    await expect(page.getByRole("button", { name: "Corte", exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Deshacer" }).click();
    await expect(page.getByRole("button", { name: "Corte", exact: true })).toBeVisible();
  });

  test("busca sin acentos ni mayúsculas, avisa si no hay y pagina de a 10", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    const nombres = Array.from({ length: 11 }, (_, i) => `Servicio ${i + 1}`);
    await cargarServicios(solista, [...nombres, "Tintura de raíz"]);
    await page.goto("/panel/servicios");

    await expect(page.getByText("1–10 de 12 servicios")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("11–12 de 12 servicios")).toBeVisible();

    await page.getByRole("searchbox", { name: "Buscar servicio" }).fill("RAIZ");
    await expect(page.getByRole("button", { name: "Tintura de raíz" })).toBeVisible();
    await expect(page.getByText("1 servicio", { exact: true })).toBeVisible();

    await page.getByRole("searchbox", { name: "Buscar servicio" }).fill("zzz");
    await expect(page.getByText("No encontramos servicios con «zzz»")).toBeVisible();
    await page.getByRole("button", { name: "Borrar la búsqueda" }).click();
    await expect(page.getByText("1–10 de 12 servicios")).toBeVisible();
  });

  test("tocar dos veces «Borrar» borra una sola vez y deja el Deshacer", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, ["Corte", "Tintura"]);
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Corte", exact: true }).click();
    await page.getByRole("button", { name: "Borrar servicio" }).dblclick();

    await expect(page.getByRole("status")).toContainText("Borraste Corte.");
    // Sin el segundo borrado fallido encima: no aparece «Quizás ya lo borraste».
    await expect(page.getByText("Quizás ya lo borraste")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Deshacer" })).toBeVisible();
  });

  test("al guardar un servicio de la segunda página se queda en la segunda página", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, Array.from({ length: 12 }, (_, i) => `Servicio ${String(i + 1).padStart(2, "0")}`));
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Servicio 11", exact: true }).click();
    const formulario = await completarFormulario(page, { precio: "2000" });
    await formulario.getByRole("button", { name: "Guardar" }).click();

    await expect(formulario).toBeHidden();
    await expect(page.getByText("11–12 de 12 servicios")).toBeVisible();
  });

  test("al borrar todo lo de la última página vuelve a la anterior", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, Array.from({ length: 11 }, (_, i) => `Servicio ${String(i + 1).padStart(2, "0")}`));
    await page.goto("/panel/servicios");

    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "Servicio 11", exact: true }).click();
    await page.getByRole("button", { name: "Borrar servicio" }).click();

    await expect(page.getByText("10 servicios", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Servicio 01", exact: true })).toBeVisible();
  });

  test("con 50 servicios no deja crear más y lo explica", async ({ page, context }) => {
    const solista = await negocioNuevo(context);
    await cargarServicios(solista, Array.from({ length: 50 }, (_, i) => `Servicio ${i + 1}`));
    await page.goto("/panel/servicios");

    await expect(page.getByText("Llegaste al máximo de 50 servicios.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Nuevo servicio" })).toBeDisabled();
  });
});

test("en celu el formulario sube como Drawer y el servicio queda en la lista", async ({ page, context }) => {
  await negocioNuevo(context);
  await page.goto("/panel/servicios");

  // En celu el botón es solo el ícono, pero tiene nombre para lectores de pantalla.
  await page.getByRole("button", { name: "Nuevo servicio" }).click();
  const formulario = await completarFormulario(page, { nombre: "Corte", duracion: "45 min", precio: "1500" });
  await formulario.getByRole("button", { name: "Guardar" }).click();

  await expect(formulario).toBeHidden();
  await expect(page.locator("[data-slot=item]", { hasText: "Corte" })).toContainText("45 min");
});
