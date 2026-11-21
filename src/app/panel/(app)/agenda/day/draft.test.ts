import { describe, expect, test } from "vitest";
import type { HourRange } from "@/lib/hours/schema";
import { type AppointmentDraft, endClock, parseDraft, parseMoveDraft, warningsOf } from "./draft";

const SERVICE_ID = "a0000000-0000-4000-8000-000000000001";
const APPOINTMENT_ID = "b0000000-0000-4000-8000-000000000001";
const draft: AppointmentDraft = {
  serviceId: SERVICE_ID,
  clientName: "Lucía",
  clientPhone: "",
  day: "2027-03-01",
  time: "14:45",
};
// 2027-03-01 es lunes.
const ranges: HourRange[] = [
  { weekday: 1, start_time: "09:00", end_time: "13:00" },
  { weekday: 1, start_time: "15:00", end_time: "19:00" },
];
const holidays = [{ date: "2027-03-01", name: "Día de prueba", kind: "fixed" as const }];

describe("parseDraft", () => {
  test("un borrador completo da los datos para guardar, con el teléfono en null si falta", () => {
    expect(parseDraft(draft)).toEqual({
      ok: true,
      data: {
        service_id: SERVICE_ID,
        client_name: "Lucía",
        client_phone: null,
        day: "2027-03-01",
        time: "14:45",
      },
    });
  });

  test("un aviso por cada campo que falla, con el campo del formulario", () => {
    const parsed = parseDraft({ serviceId: "", clientName: "  ", clientPhone: "", day: "", time: "14:47" });

    expect(parsed).toEqual({
      ok: false,
      errors: {
        service: "Elegí un servicio.",
        client: "Poné el nombre del cliente.",
        day: "Elegí un día.",
        time: "Poné la hora de a 5 minutos: 14:45 o 14:50.",
      },
    });
  });

  test("un teléfono demasiado largo avisa en el teléfono", () => {
    const parsed = parseDraft({ ...draft, clientPhone: "1".repeat(31) });

    expect(parsed).toMatchObject({ ok: false, errors: { phone: "El teléfono tiene hasta 30 caracteres." } });
  });
});

describe("parseMoveDraft", () => {
  test("da el turno, el día y la hora", () => {
    expect(parseMoveDraft(draft, APPOINTMENT_ID)).toEqual({
      ok: true,
      data: { id: APPOINTMENT_ID, day: "2027-03-01", time: "14:45" },
    });
  });

  test("avisa si falta el día o la hora no es válida", () => {
    expect(parseMoveDraft({ ...draft, day: "", time: "x" }, APPOINTMENT_ID)).toEqual({
      ok: false,
      errors: {
        day: "Elegí un día.",
        time: "Poné la hora como HH:mm, por ejemplo 14:45.",
      },
    });
  });
});

describe("endClock", () => {
  test("suma la duración a la hora", () => {
    expect(endClock("14:45", 45)).toBe("15:30");
  });

  test("con una hora que no se entiende no dice nada", () => {
    expect(endClock("14:4", 45)).toBeNull();
    expect(endClock("", 45)).toBeNull();
  });
});

describe("warningsOf", () => {
  test("un horario adentro de lo que atiende no avisa nada", () => {
    expect(warningsOf({ ...draft, day: "2027-03-08", time: "10:00" }, 30, ranges, [])).toEqual([]);
  });

  test("avisa el almuerzo, y el feriado de ese día", () => {
    const kinds = warningsOf({ ...draft, time: "13:30" }, 30, ranges, holidays).map(({ kind }) => kind);

    expect(kinds).toEqual(["holiday", "lunch"]);
  });

  test("sin una hora o un día válidos no avisa nada todavía", () => {
    expect(warningsOf({ ...draft, time: "14:" }, 30, ranges, holidays)).toEqual([]);
    expect(warningsOf({ ...draft, day: "" }, 30, ranges, holidays)).toEqual([]);
  });
});
