import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { HolidayRow } from "@/lib/holidays/parse";

const getUpcomingHolidays = vi.hoisted(() => vi.fn<() => Promise<HolidayRow[]>>());
vi.mock("@/lib/holidays/queries", () => ({ getUpcomingHolidays }));

import { HolidaysLoader } from "./loader";

const render = async () => renderToStaticMarkup(await HolidaysLoader());

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HolidaysLoader", () => {
  test("con feriados muestra la card con la lista", async () => {
    getUpcomingHolidays.mockResolvedValue([{ date: "2026-12-25", name: "Navidad", kind: "fixed" }]);

    const html = await render();

    expect(html).toContain("Próximos feriados");
    expect(html).toContain("viernes 25 de diciembre");
    expect(html).toContain("Navidad");
  });

  test("sin feriados cargados muestra el aviso de vacío, sin lista", async () => {
    getUpcomingHolidays.mockResolvedValue([]);

    const html = await render();

    expect(html).toContain("Próximos feriados");
    expect(html).toContain("No hay feriados cargados.");
    expect(html).not.toContain("<ul");
  });

  test("si falla la lectura avisa como alerta dentro de la card y lo deja en el log", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    getUpcomingHolidays.mockRejectedValue(new Error("boom"));

    const html = await render();

    expect(html).toContain("Próximos feriados");
    expect(html).toContain('role="alert"');
    expect(html).toContain("No pudimos leer los feriados. Probá de nuevo en un rato.");
    expect(html).not.toContain("<ul");
    expect(log).toHaveBeenCalledOnce();
  });
});
