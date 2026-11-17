import { describe, expect, test } from "vitest";
import { parseHolidays, upcomingHolidays } from "./holidays";

describe("parseHolidays", () => {
  test("maps the API fields to date and name", () => {
    expect(
      parseHolidays([
        { fecha: "2026-12-25", tipo: "inamovible", nombre: "Navidad" },
      ]),
    ).toEqual([{ date: "2026-12-25", name: "Navidad" }]);
  });

  test("skips malformed entries without failing the list", () => {
    const parsed = parseHolidays([
      { fecha: "25/12/2026", nombre: "Mal formato" },
      { fecha: "2026-12-08" },
      null,
      { fecha: "2026-12-08", nombre: "  Inmaculada Concepción  " },
    ]);

    expect(parsed).toEqual([
      { date: "2026-12-08", name: "Inmaculada Concepción" },
    ]);
  });

  test("throws when the response is not a list", () => {
    expect(() => parseHolidays({ error: "x" })).toThrow(
      "holidays_bad_response",
    );
  });
});

describe("upcomingHolidays", () => {
  const all = [
    { date: "2026-12-25", name: "Navidad" },
    { date: "2026-11-23", name: "Soberanía" },
    { date: "2026-12-08", name: "Inmaculada" },
    { date: "2027-01-01", name: "Año nuevo" },
    { date: "2026-12-08", name: "Inmaculada (repetido)" },
  ];

  test("drops past days, sorts and removes repeated dates", () => {
    expect(upcomingHolidays(all, "2026-12-01").map((h) => h.date)).toEqual([
      "2026-12-08",
      "2026-12-25",
      "2027-01-01",
    ]);
  });

  test("includes today", () => {
    expect(upcomingHolidays(all, "2026-12-08")[0]?.date).toBe("2026-12-08");
  });

  test("respects the limit", () => {
    expect(upcomingHolidays(all, "2026-01-01", 2)).toHaveLength(2);
  });
});
