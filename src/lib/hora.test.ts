import { describe, expect, test } from "vitest";
import { formatearHora } from "./hora";

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
