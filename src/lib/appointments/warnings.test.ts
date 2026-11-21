import { describe, expect, test } from "vitest";
import { slotWarnings } from "./warnings";

const open = [
  { from: 9 * 60, to: 13 * 60 },
  { from: 15 * 60, to: 19 * 60 },
];
const check = (start: string, minutes: number, holiday: string | null = null, spans = open) => {
  const [hours, mins] = start.split(":").map(Number);
  const startMinute = hours * 60 + mins;
  return slotWarnings({ startMinute, endMinute: startMinute + minutes, open: spans, holiday });
};

describe("slotWarnings", () => {
  test("un turno adentro del horario no avisa nada", () => {
    expect(check("10:00", 30)).toEqual([]);
  });

  test("un turno que termina justo al cierre del tramo está adentro", () => {
    expect(check("12:30", 30)).toEqual([]);
    expect(check("18:30", 30)).toEqual([]);
  });

  test("un turno en el hueco entre dos tramos avisa que es el almuerzo", () => {
    expect(check("13:30", 30)).toEqual([{ kind: "lunch", message: "Ese horario es tu almuerzo." }]);
  });

  test("un turno que arranca antes del almuerzo y lo pisa también", () => {
    expect(check("12:45", 30)).toEqual([{ kind: "lunch", message: "Ese horario es tu almuerzo." }]);
  });

  test("un turno antes de abrir o después de cerrar avisa que es fuera de horario", () => {
    expect(check("08:00", 30)).toEqual([
      { kind: "closed", message: "Ese horario está fuera de tu horario." },
    ]);
    expect(check("19:00", 30)).toEqual([
      { kind: "closed", message: "Ese horario está fuera de tu horario." },
    ]);
  });

  test("un turno que arranca adentro y termina después del cierre es fuera de horario", () => {
    expect(check("18:45", 30)[0]?.kind).toBe("closed");
  });

  test("un día sin horario es fuera de horario", () => {
    expect(check("10:00", 30, null, [])[0]?.kind).toBe("closed");
  });

  test("un feriado avisa primero y suma el horario si también corresponde", () => {
    expect(check("10:00", 30, "Día de la Soberanía")).toEqual([
      { kind: "holiday", message: "Es feriado: Día de la Soberanía." },
    ]);
    expect(check("20:00", 30, "Día de la Soberanía").map(({ kind }) => kind)).toEqual([
      "holiday",
      "closed",
    ]);
  });
});
