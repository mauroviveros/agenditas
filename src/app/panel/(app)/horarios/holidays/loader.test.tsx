import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { HolidayRow } from "@/lib/holidays/parse";

const getUpcomingHolidays = vi.hoisted(() => vi.fn<() => Promise<HolidayRow[]>>());
vi.mock("@/lib/holidays/queries", () => ({ getUpcomingHolidays }));

import { HolidaysLoader } from "./loader";

const render = async () => renderToStaticMarkup(await HolidaysLoader());

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// Solo se simula la fecha: las promesas de la lectura siguen andando normal.
const setNow = (iso: string) => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(iso));
};

describe("HolidaysLoader", () => {
  test("con feriados muestra la card con la lista", async () => {
    setNow("2026-11-18T15:00:00Z");
    getUpcomingHolidays.mockResolvedValue([{ date: "2026-12-25", name: "Navidad", kind: "fixed" }]);

    const html = await render();

    expect(html).toContain("Próximos feriados");
    expect(html).toContain("viernes 25 de diciembre");
    expect(html).toContain("Navidad");
  });

  test("marca «Hoy» con la fecha de Buenos Aires y no con la de UTC", async () => {
    // 02:30 UTC del 26 son las 23:30 del 25 en Buenos Aires
    setNow("2026-12-26T02:30:00Z");
    getUpcomingHolidays.mockResolvedValue([{ date: "2026-12-25", name: "Navidad", kind: "fixed" }]);

    const html = await render();

    expect(html).toContain(">Hoy<");
  });

  test("sin feriados cargados muestra el aviso de vacío, sin lista", async () => {
    getUpcomingHolidays.mockResolvedValue([]);

    const html = await render();

    expect(html).toContain("Próximos feriados");
    expect(html).toContain("Todavía no hay feriados para mostrar.");
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
