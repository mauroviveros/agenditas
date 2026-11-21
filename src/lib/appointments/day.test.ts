import { describe, expect, test } from "vitest";
import { resolveDay, shiftDay } from "./day";

const TODAY = "2027-03-01";

describe("resolveDay", () => {
  test("usa el día de la URL si es una fecha válida", () => {
    expect(resolveDay("2027-03-15", TODAY)).toBe("2027-03-15");
  });

  test("sin día en la URL, es hoy", () => {
    expect(resolveDay(undefined, TODAY)).toBe(TODAY);
  });

  test.each([
    ["texto cualquiera", "mañana"],
    ["fecha que no existe", "2027-02-30"],
    ["mes 13", "2027-13-01"],
    ["fecha con hora", "2027-03-15T10:00"],
    ["formato argentino", "15/03/2027"],
    ["vacío", ""],
  ])("%s vuelve a hoy", (_caso, raw) => {
    expect(resolveDay(raw, TODAY)).toBe(TODAY);
  });

  test("si la URL repite el parámetro (una lista), vuelve a hoy", () => {
    expect(resolveDay(["2027-03-15", "2027-03-16"], TODAY)).toBe(TODAY);
  });
});


describe("shiftDay", () => {
  test("suma y resta días", () => {
    expect(shiftDay("2027-03-01", 1)).toBe("2027-03-02");
    expect(shiftDay("2027-03-01", -1)).toBe("2027-02-28");
  });

  test("cruza el fin de mes y de año", () => {
    expect(shiftDay("2027-12-31", 1)).toBe("2028-01-01");
    expect(shiftDay("2028-03-01", -1)).toBe("2028-02-29");
  });
});
