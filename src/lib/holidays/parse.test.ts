import { describe, expect, test } from "vitest";
import { parseHolidays } from "./parse";

const item = (fecha: string, nombre: string, tipo: string) => ({ fecha, nombre, tipo });

describe("parseHolidays", () => {
  test("traduce la respuesta de ArgentinaDatos a filas de holidays", () => {
    const rows = parseHolidays(
      [
        item("2026-01-01", "Año nuevo", "inamovible"),
        item("2026-04-02", "Día del Veterano", "trasladable"),
        item("2026-03-23", "Puente turístico no laborable", "puente"),
      ],
      2026,
    );

    expect(rows).toEqual([
      { date: "2026-01-01", name: "Año nuevo", kind: "fixed" },
      { date: "2026-04-02", name: "Día del Veterano", kind: "movable" },
      { date: "2026-03-23", name: "Puente turístico no laborable", kind: "bridge" },
    ]);
  });

  test("recorta los espacios del nombre", () => {
    const rows = parseHolidays([item("2026-05-25", "  Revolución de Mayo ", "inamovible")], 2026);

    expect(rows[0]?.name).toBe("Revolución de Mayo");
  });

  test("quita del nombre la fecha entre paréntesis del final, que la fila ya muestra", () => {
    const rows = parseHolidays(
      [
        item("2026-11-23", "Día de la Soberanía Nacional (20/11)", "trasladable"),
        item("2026-07-09", "Día de la Independencia (Tucumán) nacional", "inamovible"),
      ],
      2026,
    );

    expect(rows.map((row) => row.name)).toEqual([
      "Día de la Soberanía Nacional",
      "Día de la Independencia (Tucumán) nacional",
    ]);
  });

  test("si una fecha viene repetida, se queda con la primera", () => {
    const rows = parseHolidays(
      [item("2026-02-16", "Carnaval", "inamovible"), item("2026-02-16", "Otro nombre", "inamovible")],
      2026,
    );

    expect(rows).toEqual([{ date: "2026-02-16", name: "Carnaval", kind: "fixed" }]);
  });

  test("un tipo que no conocemos corta la carga y dice cuál es", () => {
    expect(() => parseHolidays([item("2026-06-01", "Raro", "nolaborable")], 2026)).toThrow(
      /nolaborable/,
    );
  });

  test.each(["constructor", "toString", "__proto__"])(
    "un tipo que existe en todo objeto («%s») también es desconocido",
    (tipo) => {
      expect(() => parseHolidays([item("2026-06-01", "Raro", tipo)], 2026)).toThrow(
        /Tipo de feriado desconocido/,
      );
    },
  );

  test("un feriado de otro año corta la carga y dice cuál", () => {
    expect(() => parseHolidays([item("2027-01-01", "Año nuevo", "inamovible")], 2026)).toThrow(
      /2027-01-01/,
    );
  });

  test("más de cien feriados corta la carga: un año trae unos veinte", () => {
    const tooMany = Array.from({ length: 101 }, (_, day) =>
      item(new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10), `Feriado ${day}`, "inamovible"),
    );

    expect(() => parseHolidays(tooMany, 2026)).toThrow();
  });

  test("una fecha mal escrita corta la carga", () => {
    expect(() => parseHolidays([item("25/05/2026", "Revolución", "inamovible")], 2026)).toThrow();
  });

  test("algo que no es una lista corta la carga", () => {
    expect(() => parseHolidays({ error: "no" }, 2026)).toThrow();
  });
});
