import { describe, expect, test } from "vitest";
import { datesBetween, formatShortDate, nextDay, todayIn } from "./dates";

describe("todayIn", () => {
  test("uses the business time zone, not UTC", () => {
    const lateNightInArgentina = new Date("2026-12-08T01:30:00Z");

    expect(
      todayIn("America/Argentina/Buenos_Aires", lateNightInArgentina),
    ).toBe("2026-12-07");
    expect(todayIn("UTC", lateNightInArgentina)).toBe("2026-12-08");
  });
});

describe("formatShortDate", () => {
  test("shows weekday, day and month in Spanish", () => {
    expect(formatShortDate("2026-12-08")).toBe("mar 8 de dic");
    expect(formatShortDate("2026-12-25")).toBe("vie 25 de dic");
  });
});

describe("datesBetween", () => {
  test("includes both ends and crosses month boundaries", () => {
    expect(datesBetween("2026-12-30", "2027-01-02")).toEqual([
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
  });

  test("returns a single day when from equals to", () => {
    expect(datesBetween("2026-12-25", "2026-12-25")).toEqual(["2026-12-25"]);
  });

  test("returns nothing when the range is backwards", () => {
    expect(datesBetween("2026-12-25", "2026-12-24")).toEqual([]);
  });
});

describe("nextDay", () => {
  test("moves to the following day across a month end", () => {
    expect(nextDay("2026-02-28")).toBe("2026-03-01");
  });
});
