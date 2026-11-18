import { describe, expect, test } from "vitest";
import { parseHolidays } from "./parse";

const item = (fecha: string, nombre: string, tipo: string) => ({ fecha, nombre, tipo });

describe("parseHolidays", () => {
  test("traduce la respuesta de ArgentinaDatos a filas de holidays", () => {
    const rows = parseHolidays([
      item("2026-01-01", "Año nuevo", "inamovible"),
      item("2026-04-02", "Día del Veterano", "trasladable"),
      item("2026-03-23", "Puente turístico no laborable", "puente"),
    ]);

    expect(rows).toEqual([
      { date: "2026-01-01", name: "Año nuevo", kind: "fixed" },
      { date: "2026-04-02", name: "Día del Veterano", kind: "movable" },
      { date: "2026-03-23", name: "Puente turístico no laborable", kind: "bridge" },
    ]);
  });

  test("recorta los espacios del nombre", () => {
    expect(parseHolidays([item("2026-05-25", "  Revolución de Mayo ", "inamovible")])[0]?.name).toBe(
      "Revolución de Mayo",
    );
  });

  test("si una fecha viene repetida, se queda con la primera", () => {
    const rows = parseHolidays([
      item("2026-02-16", "Carnaval", "inamovible"),
      item("2026-02-16", "Otro nombre", "inamovible"),
    ]);

    expect(rows).toEqual([{ date: "2026-02-16", name: "Carnaval", kind: "fixed" }]);
  });

  test("un tipo que no conocemos corta la carga y dice cuál es", () => {
    expect(() => parseHolidays([item("2026-06-01", "Raro", "nolaborable")])).toThrow(/nolaborable/);
  });

  test("una fecha mal escrita corta la carga", () => {
    expect(() => parseHolidays([item("25/05/2026", "Revolución", "inamovible")])).toThrow();
  });

  test("algo que no es una lista corta la carga", () => {
    expect(() => parseHolidays({ error: "no" })).toThrow();
  });
});
