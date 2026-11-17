import { describe, expect, test } from "vitest";
import { monthName, weekOf } from "./week";

const BA = "America/Argentina/Buenos_Aires";

describe("weekOf", () => {
  test("returns monday to sunday around a tuesday and marks today", () => {
    const days = weekOf(new Date("2026-11-17T15:00:00Z"), BA);

    expect(days.map((d) => d.day)).toEqual([16, 17, 18, 19, 20, 21, 22]);
    expect(days.map((d) => d.weekday)).toEqual([
      "lun",
      "mar",
      "mié",
      "jue",
      "vie",
      "sáb",
      "dom",
    ]);
    expect(days.filter((d) => d.isToday).map((d) => d.day)).toEqual([17]);
  });

  test("uses the Buenos Aires day, not the UTC one, after 21:00 local", () => {
    // 01:00 UTC del 18 son las 22:00 del 17 en Argentina.
    const days = weekOf(new Date("2026-11-18T01:00:00Z"), BA);

    expect(days.find((d) => d.isToday)?.day).toBe(17);
  });

  test("keeps the week ending on sunday when today is sunday", () => {
    const days = weekOf(new Date("2026-11-22T15:00:00Z"), BA);

    expect(days[0]?.day).toBe(16);
    expect(days[6]).toMatchObject({ day: 22, isToday: true });
  });

  test("crosses the month boundary", () => {
    const days = weekOf(new Date("2026-12-01T15:00:00Z"), BA);

    expect(days.map((d) => d.day)).toEqual([30, 1, 2, 3, 4, 5, 6]);
  });
});

describe("monthName", () => {
  test("names the month in Spanish with a capital", () => {
    expect(monthName(new Date("2026-11-17T15:00:00Z"), BA)).toBe("Noviembre");
  });
});
