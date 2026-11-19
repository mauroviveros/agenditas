import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Service } from "@/lib/services/queries";

const getMyServices = vi.hoisted(() => vi.fn<() => Promise<Service[]>>());
vi.mock("@/lib/services/queries", () => ({ getMyServices }));
vi.mock("../../panel-slots", () => ({ PanelHeaderActions: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ServicesLoader } from "./loader";

const render = async () => renderToStaticMarkup(await ServicesLoader());

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ServicesLoader", () => {
  test("con servicios muestra la lista", async () => {
    getMyServices.mockResolvedValue([
      { id: "s-1", name: "Corte", duration_minutes: 30, price_cents: 1_500_000 },
    ]);

    const html = await render();

    expect(html).toContain("Corte");
    expect(html).toContain("1 servicio");
  });

  test("sin servicios muestra el aviso de vacío", async () => {
    getMyServices.mockResolvedValue([]);

    expect(await render()).toContain("Todavía no cargaste servicios");
  });

  test("si falla la lectura avisa y deja probar de nuevo, sin lista ni vacío", async () => {
    getMyServices.mockRejectedValue(new Error("connection refused"));

    const html = await render();

    expect(html).toContain("No pudimos leer tus servicios");
    expect(html).toContain("Probá de nuevo");
    expect(html).not.toContain("<table");
    expect(html).not.toContain("Todavía no cargaste servicios");
  });

  test("el error de la lectura se registra y no llega a la pantalla", async () => {
    getMyServices.mockRejectedValue(new Error("connection refused"));

    const html = await render();

    expect(console.error).toHaveBeenCalled();
    expect(html).not.toContain("connection refused");
  });
});
