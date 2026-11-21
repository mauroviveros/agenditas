import { describe, expect, test } from "vitest";
import { dayBounds, resolveDay } from "./day";

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

describe("dayBounds", () => {
  test("el día arranca a medianoche de Buenos Aires (03:00 UTC) y dura 24 horas", () => {
    expect(dayBounds("2027-03-01")).toEqual({
      from: "2027-03-01T03:00:00.000Z",
      to: "2027-03-02T03:00:00.000Z",
    });
  });

  test("el último día del mes pasa al mes siguiente", () => {
    expect(dayBounds("2027-12-31").to).toBe("2028-01-01T03:00:00.000Z");
  });

  test("un 29 de febrero bisiesto existe", () => {
    expect(dayBounds("2028-02-29").to).toBe("2028-03-01T03:00:00.000Z");
  });
});
