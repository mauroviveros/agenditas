import { describe, expect, test } from "vitest";
import type { AgendaItem } from "./parse";
import { snapMinute, suggestTime } from "./suggest";

// 14:17 de ese lunes en Buenos Aires.
const NOW = new Date("2027-03-01T17:17:00Z");
const TODAY = "2027-03-01";
const open = [{ from: 9 * 60, to: 18 * 60 }];
const blockAt = (start: string, end: string): AgendaItem => ({
  kind: "block",
  id: start,
  startsAt: `2027-03-01T${start}:00Z`,
  endsAt: `2027-03-01T${end}:00Z`,
});

const blockOn = (date: string, start: string, end: string): AgendaItem => ({
  kind: "block",
  id: `${date}-${start}`,
  startsAt: `${date}T${start}:00Z`,
  endsAt: `${date}T${end}:00Z`,
});

describe("suggestTime", () => {
  test("hoy arranca en el próximo cuarto de hora desde ahora", () => {
    expect(suggestTime(TODAY, [], open, NOW, 30)).toBe("14:30");
  });

  test("otro día arranca cuando abre", () => {
    expect(suggestTime("2027-03-02", [], open, NOW, 30)).toBe("09:00");
  });

  test("un día sin horario arranca a las 09:00", () => {
    expect(suggestTime("2027-03-02", [], [], NOW, 30)).toBe("09:00");
  });

  test("si cae sobre algo ocupado, corre hasta que termina", () => {
    // Bloqueo 14:30–15:00 (17:30–18:00 UTC).
    expect(suggestTime(TODAY, [blockAt("17:30", "18:00")], open, NOW, 30)).toBe("15:00");
  });

  test("si lo ocupado viene encadenado, sigue hasta el primer hueco", () => {
    const items = [blockAt("17:30", "18:00"), blockAt("18:00", "18:32")];

    expect(suggestTime(TODAY, items, open, NOW, 30)).toBe("15:35");
  });

  test("un turno que entra antes de lo ocupado no se corre", () => {
    // Ocupado desde las 15:00; 30 minutos desde las 14:30 terminan justo a las 15:00.
    expect(suggestTime(TODAY, [blockAt("18:00", "18:30")], open, NOW, 30)).toBe("14:30");
  });

  test("uno más largo que el hueco se corre después", () => {
    expect(suggestTime(TODAY, [blockAt("18:00", "18:30")], open, NOW, 60)).toBe("15:30");
  });

  test("tarde a la noche no pasa de las 23:55", () => {
    const late = new Date("2027-03-02T02:50:00Z");

    expect(suggestTime("2027-03-01", [], open, late, 30)).toBe("23:55");
  });

  test("si no queda hueco en el día, no sugiere una hora que pise algo", () => {
    const late = new Date("2027-03-02T02:50:00Z"); // 23:50 en Buenos Aires
    const ocupado = [blockOn("2027-03-02", "02:40", "03:00")]; // 23:40–24:00 en Buenos Aires

    expect(suggestTime("2027-03-01", ocupado, open, late, 30)).toBe("");
  });

  test("si lo ocupado termina justo en 23:55, sigue siendo una hora válida", () => {
    const late = new Date("2027-03-02T02:50:00Z");

    expect(suggestTime("2027-03-01", [blockOn("2027-03-02", "02:30", "02:55")], open, late, 5)).toBe("23:55");
  });
});

describe("snapMinute", () => {
  test("redondea al cuarto de hora más cercano", () => {
    expect(snapMinute(14 * 60 + 52)).toBe(14 * 60 + 45);
    expect(snapMinute(14 * 60 + 53)).toBe(15 * 60);
  });
});
