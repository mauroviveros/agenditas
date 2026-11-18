import { describe, expect, test } from "vitest";
import { placeIssues } from "./issues";
import type { Week } from "./week";

const slot = (start_time: string, end_time: string) => ({ start_time, end_time });

// Lunes con dos franjas, martes cerrado, miércoles con una: las franjas, contadas de
// corrido, son la 0 y la 1 (lunes) y la 2 (miércoles).
const week: Week = [
  [slot("09:00", "13:00"), slot("14:00", "18:00")],
  [],
  [slot("10:00", "12:00")],
  [],
  [],
  [],
  [],
];

describe("placeIssues", () => {
  test("ubica cada aviso en el día y la franja que le tocan", () => {
    const { byDay, general } = placeIssues(week, [
      { path: [1], message: "Se pisa con otra franja" },
      { path: [2], message: "Muy corta" },
    ]);

    expect(byDay.get(0)?.get(1)).toBe("Se pisa con otra franja");
    expect(byDay.get(2)?.get(0)).toBe("Muy corta");
    expect(general).toEqual([]);
  });

  test("un aviso que no es de una franja va aparte", () => {
    const { byDay, general } = placeIssues(week, [
      { path: [], message: "Demasiadas franjas" },
      { path: [99], message: "Franja que no existe" },
    ]);

    expect(byDay.size).toBe(0);
    expect(general).toEqual(["Demasiadas franjas", "Franja que no existe"]);
  });

  test("si una franja tiene varios avisos, queda el primero", () => {
    const { byDay } = placeIssues(week, [
      { path: [0], message: "Primero" },
      { path: [0], message: "Segundo" },
    ]);

    expect(byDay.get(0)?.get(0)).toBe("Primero");
  });
});
