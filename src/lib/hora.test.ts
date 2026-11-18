import { describe, expect, test } from "vitest";
import { formatearHora, weekdayIndex } from "./hora";

describe("formatearHora", () => {
  test("muestra la hora de Buenos Aires aunque el instante venga en UTC", () => {
    // Arrange: 17:30 UTC son las 14:30 en Buenos Aires (UTC-3)
    const instante = new Date("2026-11-17T17:30:00Z");

    // Act
    const hora = formatearHora(instante);

    // Assert
    expect(hora).toBe("14:30");
  });

  test("usa 24 horas con dos dígitos", () => {
    expect(formatearHora(new Date("2026-11-17T12:05:00Z"))).toBe("09:05");
  });

  test("cruza la medianoche al día anterior en Buenos Aires", () => {
    expect(formatearHora(new Date("2026-11-18T02:15:00Z"))).toBe("23:15");
  });
});

describe("weekdayIndex", () => {
  test("cuenta desde el lunes (0) hasta el domingo (6)", () => {
    // 2026-11-16 es lunes y 2026-11-22 es domingo
    expect(weekdayIndex(new Date("2026-11-16T15:00:00Z"))).toBe(0);
    expect(weekdayIndex(new Date("2026-11-18T15:00:00Z"))).toBe(2);
    expect(weekdayIndex(new Date("2026-11-22T15:00:00Z"))).toBe(6);
  });

  test("usa el día de Buenos Aires, no el de UTC", () => {
    // 02:15 UTC del miércoles son las 23:15 del martes en Buenos Aires
    expect(weekdayIndex(new Date("2026-11-18T02:15:00Z"))).toBe(1);
  });
});
