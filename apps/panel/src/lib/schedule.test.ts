import { describe, expect, test } from "vitest";
import {
  type DayDraft,
  draftsFromRows,
  hoursPayload,
  TIME_OPTIONS,
  validateDay,
} from "./schedule";

function day(overrides: Partial<DayDraft> = {}): DayDraft {
  return {
    weekday: 1,
    open: true,
    opens: "09:00",
    closes: "18:00",
    lunch: false,
    lunchStarts: "13:00",
    lunchEnds: "14:00",
    ...overrides,
  };
}

describe("TIME_OPTIONS", () => {
  test("goes from 00:00 to 23:45 in quarter hours", () => {
    expect(TIME_OPTIONS).toHaveLength(96);
    expect(TIME_OPTIONS[0]).toBe("00:00");
    expect(TIME_OPTIONS[37]).toBe("09:15");
    expect(TIME_OPTIONS.at(-1)).toBe("23:45");
  });
});

describe("draftsFromRows", () => {
  test("returns seven days from Monday, closed when there is no row", () => {
    const week = draftsFromRows([]);

    expect(week.map((entry) => entry.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(week.every((entry) => !entry.open)).toBe(true);
  });

  test("opens the saved days and drops the seconds Postgres adds", () => {
    const week = draftsFromRows([
      {
        weekday: 2,
        opens: "10:00:00",
        closes: "19:30:00",
        lunch_starts: "13:00:00",
        lunch_ends: "14:15:00",
      },
    ]);

    expect(week[1]).toMatchObject({
      open: true,
      opens: "10:00",
      closes: "19:30",
      lunch: true,
      lunchStarts: "13:00",
      lunchEnds: "14:15",
    });
    expect(week[0]?.open).toBe(false);
  });

  test("a day without lunch keeps the lunch switch off", () => {
    const [monday] = draftsFromRows([
      {
        weekday: 1,
        opens: "09:00:00",
        closes: "18:00:00",
        lunch_starts: null,
        lunch_ends: null,
      },
    ]);

    expect(monday?.lunch).toBe(false);
  });
});

describe("validateDay", () => {
  test("accepts a closed day whatever its hours say", () => {
    expect(
      validateDay(day({ open: false, opens: "18:00", closes: "09:00" })),
    ).toBeNull();
  });

  test("accepts a normal day with and without lunch", () => {
    expect(validateDay(day())).toBeNull();
    expect(validateDay(day({ lunch: true }))).toBeNull();
  });

  test("rejects closing at or before opening", () => {
    expect(validateDay(day({ closes: "09:00" }))).toBe(
      "Tiene que cerrar después de abrir.",
    );
    expect(validateDay(day({ closes: "08:00" }))).toBe(
      "Tiene que cerrar después de abrir.",
    );
  });

  test("rejects an empty or backwards lunch", () => {
    expect(validateDay(day({ lunch: true, lunchEnds: "13:00" }))).toBe(
      "El almuerzo tiene que terminar después de empezar.",
    );
  });

  test("rejects lunch touching the opening or closing time", () => {
    const outside = "El almuerzo tiene que quedar adentro del horario.";

    expect(validateDay(day({ lunch: true, lunchStarts: "09:00" }))).toBe(
      outside,
    );
    expect(validateDay(day({ lunch: true, lunchEnds: "18:00" }))).toBe(outside);
  });

  test("ignores the lunch fields while the lunch switch is off", () => {
    expect(
      validateDay(day({ lunchStarts: "20:00", lunchEnds: "21:00" })),
    ).toBeNull();
  });
});

describe("hoursPayload", () => {
  test("sends only open days, with null lunch when it is off", () => {
    const payload = hoursPayload([
      day({ weekday: 1, lunch: true }),
      day({ weekday: 2, open: false }),
      day({ weekday: 3 }),
    ]);

    expect(payload).toEqual([
      {
        weekday: 1,
        opens: "09:00",
        closes: "18:00",
        lunch_starts: "13:00",
        lunch_ends: "14:00",
      },
      {
        weekday: 3,
        opens: "09:00",
        closes: "18:00",
        lunch_starts: null,
        lunch_ends: null,
      },
    ]);
  });

  test("an all-closed week sends an empty list", () => {
    expect(hoursPayload([day({ open: false })])).toEqual([]);
  });
});
