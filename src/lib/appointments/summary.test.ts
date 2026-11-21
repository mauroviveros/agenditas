import { describe, expect, test } from "vitest";
import { describeDay } from "./summary";

const lunchDay = [
  { from: 9 * 60, to: 13 * 60 },
  { from: 15 * 60, to: 19 * 60 },
];

describe("describeDay", () => {
  test("cuenta los turnos y dice cuándo atiende", () => {
    expect(describeDay(6, lunchDay)).toBe("6 turnos · atendés de 09:00 a 13:00 y de 15:00 a 19:00");
  });

  test("un turno va en singular", () => {
    expect(describeDay(1, [{ from: 9 * 60, to: 18 * 60 }])).toBe("1 turno · atendés de 09:00 a 18:00");
  });

  test("sin turnos lo dice", () => {
    expect(describeDay(0, lunchDay)).toBe(
      "No hay turnos este día · atendés de 09:00 a 13:00 y de 15:00 a 19:00",
    );
  });

  test("un día sin horario lo dice", () => {
    expect(describeDay(2, [])).toBe("2 turnos · no atendés este día");
  });
});
