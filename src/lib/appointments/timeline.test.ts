import { describe, expect, test } from "vitest";
import type { HourRange } from "@/lib/hours/schema";
import type { AgendaItem } from "./parse";
import { buildTimeline, DEFAULT_WINDOW, weekdayOf } from "./timeline";

// 2027-03-01 es lunes. Las horas de los turnos van en UTC: Buenos Aires es UTC-3.
const MONDAY = "2027-03-01";
// 14:17 de ese lunes en Buenos Aires.
const NOW = new Date("2027-03-01T17:17:00Z");
const week: HourRange[] = [
  { weekday: 1, start_time: "09:00", end_time: "13:00" },
  { weekday: 1, start_time: "15:00", end_time: "19:00" },
  { weekday: 2, start_time: "10:00", end_time: "14:00" },
];

const appointment = (id: string, startsAt: string, endsAt: string): AgendaItem => ({
  kind: "appointment",
  id,
  startsAt,
  endsAt,
  serviceName: "Corte",
  priceCents: 100,
  clientName: "Lucía",
  clientPhone: null,
});
const block = (id: string, startsAt: string, endsAt: string): AgendaItem => ({
  kind: "block",
  id,
  startsAt,
  endsAt,
});

describe("weekdayOf", () => {
  test("cuenta de lunes (1) a domingo (7), como los horarios", () => {
    expect(weekdayOf("2027-03-01")).toBe(1);
    expect(weekdayOf("2027-03-07")).toBe(7);
  });
});

describe("buildTimeline: la ventana", () => {
  test("es el horario del día, en horas enteras", () => {
    const timeline = buildTimeline(MONDAY, [], week, NOW);

    expect(timeline.fromMinute).toBe(9 * 60);
    expect(timeline.toMinute).toBe(19 * 60);
  });

  test("ignora los horarios de otros días", () => {
    const timeline = buildTimeline("2027-03-02", [], week, NOW);

    expect(timeline.fromMinute).toBe(10 * 60);
    expect(timeline.toMinute).toBe(14 * 60);
  });

  test("un turno fuera del horario la agranda hasta la hora entera", () => {
    // 07:30–08:00 y 20:00–20:15 en Buenos Aires.
    const early = appointment("a", "2027-03-01T10:30:00Z", "2027-03-01T11:00:00Z");
    const late = appointment("b", "2027-03-01T23:00:00Z", "2027-03-01T23:15:00Z");

    const timeline = buildTimeline(MONDAY, [early, late], week, NOW);

    expect(timeline.fromMinute).toBe(7 * 60);
    expect(timeline.toMinute).toBe(21 * 60);
  });

  test("un día sin horario ni turnos usa la ventana por defecto", () => {
    const timeline = buildTimeline("2027-03-07", [], week, NOW);

    expect(timeline.fromMinute).toBe(DEFAULT_WINDOW.from);
    expect(timeline.toMinute).toBe(DEFAULT_WINDOW.to);
  });

  test("un día cerrado con un turno se arma alrededor del turno", () => {
    // 10:20–10:50 en Buenos Aires, un domingo sin horario.
    const item = appointment("a", "2027-03-07T13:20:00Z", "2027-03-07T13:50:00Z");

    const timeline = buildTimeline("2027-03-07", [item], week, NOW);

    expect(timeline.fromMinute).toBe(10 * 60);
    expect(timeline.toMinute).toBe(11 * 60);
  });
});

describe("buildTimeline: las franjas", () => {
  test("el hueco entre dos tramos es almuerzo y lo de afuera es cerrado", () => {
    // Un turno a las 20:00 agranda la ventana hasta las 21:00.
    const late = appointment("b", "2027-03-01T23:00:00Z", "2027-03-01T23:15:00Z");

    const { bands } = buildTimeline(MONDAY, [late], week, NOW);

    expect(bands).toEqual([
      { kind: "lunch", from: 13 * 60, to: 15 * 60 },
      { kind: "closed", from: 19 * 60, to: 21 * 60 },
    ]);
  });

  test("lo anterior a la apertura es cerrado", () => {
    // 07:30–08:00 en Buenos Aires.
    const early = appointment("a", "2027-03-01T10:30:00Z", "2027-03-01T11:00:00Z");

    const { bands } = buildTimeline(MONDAY, [early], week, NOW);

    expect(bands[0]).toEqual({ kind: "closed", from: 7 * 60, to: 9 * 60 });
  });

  test("un día con un solo tramo no tiene almuerzo", () => {
    expect(buildTimeline("2027-03-02", [], week, NOW).bands).toEqual([]);
  });

  test("un día sin horario es cerrado de punta a punta", () => {
    const timeline = buildTimeline("2027-03-07", [], week, NOW);

    expect(timeline.bands).toEqual([
      { kind: "closed", from: DEFAULT_WINDOW.from, to: DEFAULT_WINDOW.to },
    ]);
  });
});

describe("buildTimeline: los bloques", () => {
  test("cada uno trae su inicio y su fin en minutos desde la medianoche", () => {
    // 10:00–10:30 en Buenos Aires.
    const item = appointment("a", "2027-03-01T13:00:00+00:00", "2027-03-01T13:30:00+00:00");

    const { blocks } = buildTimeline(MONDAY, [item], week, NOW);

    expect(blocks[0]).toMatchObject({ item, startMinute: 600, endMinute: 630 });
  });

  test("un turno que cruza la medianoche se corta en los bordes del día", () => {
    // 23:30 del domingo a 00:30 del lunes, visto desde el lunes.
    const item = appointment("a", "2027-03-01T02:30:00Z", "2027-03-01T03:30:00Z");

    const { blocks } = buildTimeline(MONDAY, [item], week, NOW);

    expect(blocks[0]).toMatchObject({ startMinute: 0, endMinute: 30 });
  });
});

describe("buildTimeline: ahora", () => {
  // Pasado 12:00–13:00, en curso 14:00–14:30, siguiente 15:30–16:00 y otro 18:30–19:00.
  const past = appointment("past", "2027-03-01T15:00:00Z", "2027-03-01T16:00:00Z");
  const current = appointment("current", "2027-03-01T17:00:00Z", "2027-03-01T17:30:00Z");
  const next = appointment("next", "2027-03-01T18:30:00Z", "2027-03-01T19:00:00Z");
  const later = appointment("later", "2027-03-01T21:30:00Z", "2027-03-01T22:00:00Z");
  const statuses = (day: string, items: AgendaItem[], now: Date) =>
    buildTimeline(day, items, week, now).blocks.map(({ item, status }) => [item.id, status]);

  test("la línea de ahora está en minutos desde la medianoche", () => {
    expect(buildTimeline(MONDAY, [], week, NOW).nowMinute).toBe(14 * 60 + 17);
  });

  test("marca lo pasado, lo que está en curso y el siguiente", () => {
    expect(statuses(MONDAY, [past, current, next, later], NOW)).toEqual([
      ["past", "past"],
      ["current", "current"],
      ["next", "later"],
      ["later", "later"],
    ]);
  });

  test("sin nada en curso, el siguiente turno es el que viene", () => {
    expect(statuses(MONDAY, [past, next, later], NOW)).toEqual([
      ["past", "past"],
      ["next", "next"],
      ["later", "later"],
    ]);
  });

  test("un bloqueo nunca es el siguiente: el siguiente es un turno", () => {
    // Bloqueo 14:30–15:00, antes del turno de las 15:30.
    const blocked = block("blocked", "2027-03-01T17:30:00Z", "2027-03-01T18:00:00Z");

    expect(statuses(MONDAY, [blocked, next], NOW)).toEqual([
      ["blocked", "later"],
      ["next", "next"],
    ]);
  });

  test("un turno que termina justo ahora ya pasó", () => {
    // 13:47–14:17.
    const ending = appointment("ending", "2027-03-01T16:47:00Z", "2027-03-01T17:17:00Z");

    expect(statuses(MONDAY, [ending], NOW)).toEqual([["ending", "past"]]);
  });

  test("en un día futuro no hay línea de ahora ni siguiente: todo viene después", () => {
    const tuesday = appointment("t", "2027-03-02T13:00:00Z", "2027-03-02T13:30:00Z");

    const timeline = buildTimeline("2027-03-02", [tuesday], week, NOW);

    expect(timeline.nowMinute).toBeNull();
    expect(timeline.blocks.map(({ status }) => status)).toEqual(["later"]);
  });

  test("en un día pasado todo ya pasó", () => {
    const sunday = appointment("s", "2027-02-28T13:00:00Z", "2027-02-28T13:30:00Z");

    const timeline = buildTimeline("2027-02-28", [sunday], week, NOW);

    expect(timeline.nowMinute).toBeNull();
    expect(timeline.blocks.map(({ status }) => status)).toEqual(["past"]);
  });

  test("si ahora queda fuera de la ventana, no hay línea", () => {
    // 22:00 de ese lunes en Buenos Aires: el horario termina a las 19.
    const night = new Date("2027-03-02T01:00:00Z");

    expect(buildTimeline(MONDAY, [], week, night).nowMinute).toBeNull();
  });
});
