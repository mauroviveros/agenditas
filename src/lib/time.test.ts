import { describe, expect, test } from "vitest";
import { dateInBuenosAires, formatDate, formatTime, formatUntil, weekdayIndex } from "./time";

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

describe("dateInBuenosAires", () => {
  test("devuelve el día de Buenos Aires como AAAA-MM-DD", () => {
    expect(dateInBuenosAires(new Date("2026-11-18T15:00:00Z"))).toBe("2026-11-18");
  });

  test("usa el día de Buenos Aires, no el de UTC", () => {
    // 02:15 UTC del 18 son las 23:15 del 17 en Buenos Aires
    expect(dateInBuenosAires(new Date("2026-11-18T02:15:00Z"))).toBe("2026-11-17");
  });
});

describe("formatDate", () => {
  const today = "2026-11-18";

  test("muestra el día de la semana, el número y el mes en español", () => {
    expect(formatDate("2026-05-25", today)).toBe("lunes 25 de mayo");
    expect(formatDate("2026-12-08", today)).toBe("martes 8 de diciembre");
  });

  test("agrega el año cuando no es el de hoy", () => {
    expect(formatDate("2027-01-01", today)).toBe("viernes 1 de enero de 2027");
  });

  test("no corre el día por la zona horaria", () => {
    expect(formatDate("2027-01-01", "2027-01-01")).toBe("viernes 1 de enero");
  });
});

describe("formatTime", () => {
  test("muestra la hora de Buenos Aires en 24 h", () => {
    expect(formatTime("2027-03-01T13:00:00+00:00")).toBe("10:00");
    expect(formatTime("2027-03-01T22:45:00Z")).toBe("19:45");
  });

  test("la medianoche es 00:00 y no 24:00", () => {
    expect(formatTime("2027-03-01T03:00:00Z")).toBe("00:00");
  });
});

describe("formatUntil", () => {
  test("menos de una hora son minutos", () => {
    expect(formatUntil(28)).toBe("28 min");
  });

  test("una hora o más suma las horas", () => {
    expect(formatUntil(73)).toBe("1 h 13 min");
  });

  test("una hora justa no lleva minutos", () => {
    expect(formatUntil(120)).toBe("2 h");
  });
});
