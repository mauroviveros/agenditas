import { describe, expect, test } from "vitest";
import { formatDuration, formatPrice, formatTime } from "./format";

describe("formatPrice", () => {
  test("uses a dot for thousands and no decimals", () => {
    expect(formatPrice(19500)).toBe("$19.500");
    expect(formatPrice(1250000)).toBe("$1.250.000");
  });

  test("leaves short amounts without a separator", () => {
    expect(formatPrice(900)).toBe("$900");
    expect(formatPrice(1500)).toBe("$1.500");
  });

  test("shows zero as an amount, not as a missing price", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  test("asks to consult when there is no price", () => {
    expect(formatPrice(null)).toBe("Consultar");
  });
});

describe("formatDuration", () => {
  test("shows minutes under an hour", () => {
    expect(formatDuration(5)).toBe("5 min");
    expect(formatDuration(45)).toBe("45 min");
  });

  test("shows whole hours without minutes", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(480)).toBe("8 h");
  });

  test("combines hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
    expect(formatDuration(125)).toBe("2 h 5 min");
  });
});

describe("formatTime", () => {
  test("drops the seconds Postgres adds", () => {
    expect(formatTime("09:00:00")).toBe("09:00");
    expect(formatTime("13:30:00")).toBe("13:30");
  });

  test("keeps an HH:MM value as it is", () => {
    expect(formatTime("18:15")).toBe("18:15");
  });
});
