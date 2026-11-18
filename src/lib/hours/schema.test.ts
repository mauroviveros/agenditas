import { describe, expect, test } from "vitest";
import { MAX_RANGES, hoursSchema, toHourRange } from "./schema";

const range = (weekday: number, start_time: string, end_time: string) => ({
  weekday,
  start_time,
  end_time,
});

describe("hoursSchema", () => {
  test("acepta una semana con almuerzo (el hueco entre dos franjas)", () => {
    const week = [
      range(1, "09:00", "13:00"),
      range(1, "15:00", "19:00"),
      range(2, "09:00", "13:00"),
    ];

    expect(hoursSchema.safeParse(week).success).toBe(true);
  });

  test("acepta una semana vacía: el negocio no atiende", () => {
    expect(hoursSchema.safeParse([]).success).toBe(true);
  });

  test("acepta franjas pegadas y la misma franja en otro día", () => {
    const week = [
      range(1, "09:00", "13:00"),
      range(1, "13:00", "19:00"),
      range(2, "09:00", "13:00"),
    ];

    expect(hoursSchema.safeParse(week).success).toBe(true);
  });

  test("no importa en qué orden vengan las franjas", () => {
    const week = [range(1, "15:00", "19:00"), range(1, "09:00", "13:00")];

    expect(hoursSchema.safeParse(week).success).toBe(true);
  });

  test("rechaza un día fuera de 1 a 7", () => {
    expect(hoursSchema.safeParse([range(0, "09:00", "13:00")]).success).toBe(
      false,
    );
    expect(hoursSchema.safeParse([range(8, "09:00", "13:00")]).success).toBe(
      false,
    );
  });

  test("rechaza un día con decimales", () => {
    expect(hoursSchema.safeParse([range(1.5, "09:00", "13:00")]).success).toBe(
      false,
    );
  });

  test("rechaza horas con formato inválido o que no existen", () => {
    // Como fin, con inicio 00:00: el orden no la frena, solo el formato.
    for (const bad of ["9:00", "24:00", "09:60", "0900", "09:00:00", ""]) {
      expect(hoursSchema.safeParse([range(1, "00:00", bad)]).success, bad).toBe(
        false,
      );
    }
  });

  test("rechaza que el fin sea antes o igual que el inicio", () => {
    const before = hoursSchema.safeParse([range(1, "13:00", "09:00")]);
    const equal = hoursSchema.safeParse([range(1, "09:00", "09:00")]);

    expect(before.success).toBe(false);
    expect(equal.success).toBe(false);
    expect(before.error?.issues[0]?.message).toBe(
      "El fin tiene que ser después del inicio.",
    );
  });

  test("rechaza dos franjas que se pisan el mismo día", () => {
    const result = hoursSchema.safeParse([
      range(1, "09:00", "13:00"),
      range(1, "12:00", "16:00"),
    ]);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Hay dos franjas del mismo día que se pisan.",
    );
  });

  test("señala la franja que se pisa con la anterior, aunque vengan desordenadas", () => {
    const result = hoursSchema.safeParse([
      range(1, "12:00", "16:00"),
      range(1, "09:00", "13:00"),
    ]);

    // La que arranca más tarde es la que pisa: es la primera de la lista (índice 0).
    expect(result.error?.issues[0]?.path).toEqual([0, "start_time"]);
  });

  test("rechaza más franjas que el tope", () => {
    const tooMany = Array.from({ length: MAX_RANGES + 1 }, () =>
      range(1, "09:00", "10:00"),
    );

    expect(hoursSchema.safeParse(tooMany).success).toBe(false);
  });

  test("rechaza algo que no es una lista o le faltan campos", () => {
    expect(hoursSchema.safeParse({ weekday: 1 }).success).toBe(false);
    expect(
      hoursSchema.safeParse([{ weekday: 1, start_time: "09:00" }]).success,
    ).toBe(false);
  });
});

describe("toHourRange", () => {
  test("recorta los segundos que devuelve la base", () => {
    expect(
      toHourRange({ weekday: 1, start_time: "09:00:00", end_time: "13:30:00" }),
    ).toEqual(range(1, "09:00", "13:30"));
  });
});
