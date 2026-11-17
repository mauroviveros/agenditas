import { describe, expect, test } from "vitest";
import { groupClosedDays } from "./closed-days";

describe("groupClosedDays", () => {
  test("joins consecutive days with the same note", () => {
    const ranges = groupClosedDays([
      { on_date: "2026-12-22", note: "Vacaciones" },
      { on_date: "2026-12-21", note: "Vacaciones" },
      { on_date: "2026-12-23", note: "Vacaciones" },
    ]);

    expect(ranges).toEqual([
      {
        from: "2026-12-21",
        to: "2026-12-23",
        note: "Vacaciones",
        dates: ["2026-12-21", "2026-12-22", "2026-12-23"],
      },
    ]);
  });

  test("keeps apart days with a gap or a different note", () => {
    const ranges = groupClosedDays([
      { on_date: "2026-12-21", note: "Vacaciones" },
      { on_date: "2026-12-22", note: null },
      { on_date: "2026-12-24", note: null },
    ]);

    expect(ranges.map((range) => range.dates)).toEqual([
      ["2026-12-21"],
      ["2026-12-22"],
      ["2026-12-24"],
    ]);
  });

  test("joins days across a month boundary", () => {
    const ranges = groupClosedDays([
      { on_date: "2026-12-31", note: null },
      { on_date: "2027-01-01", note: null },
    ]);

    expect(ranges).toHaveLength(1);
  });

  test("returns nothing for no days", () => {
    expect(groupClosedDays([])).toEqual([]);
  });
});
