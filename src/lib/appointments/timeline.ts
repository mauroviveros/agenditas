import type { HourRange } from "@/lib/hours/schema";
import { dateInBuenosAires, dayBounds, weekdayIndex } from "@/lib/time";
import type { AgendaItem } from "./parse";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MS_PER_MINUTE = 60_000;

// La ventana de un día sin horario ni turnos: de 8 a 20.
export const DEFAULT_WINDOW = { from: 8 * MINUTES_PER_HOUR, to: 20 * MINUTES_PER_HOUR };

export interface Span {
  from: number;
  to: number;
}

/** Lo que no es atención: el almuerzo (hueco entre dos tramos) o cerrado (el resto). */
export interface Band extends Span {
  kind: "closed" | "lunch";
}

/** Dónde está cada uno respecto de ahora; `next` es el turno que viene. */
export type BlockStatus = "past" | "current" | "next" | "later";

export interface TimelineBlock {
  item: AgendaItem;
  /** Minutos desde la medianoche de Buenos Aires, cortados a los bordes del día. */
  startMinute: number;
  endMinute: number;
  status: BlockStatus;
}

export interface Timeline {
  /** La ventana que se dibuja, en minutos desde la medianoche y en horas enteras. */
  fromMinute: number;
  toMinute: number;
  bands: Band[];
  blocks: TimelineBlock[];
  /** La hora actual en minutos desde la medianoche; null si no es hoy o cae fuera de la ventana. */
  nowMinute: number | null;
}

// Día de la semana como lo guardan los horarios: 1 = lunes … 7 = domingo.
export function weekdayOf(day: string): number {
  return weekdayIndex(new Date(`${day}T12:00:00Z`)) + 1;
}

/** Los tramos en que atiende ese día, por hora, en minutos desde la medianoche. */
export function openSpans(day: string, ranges: HourRange[]): Span[] {
  const weekday = weekdayOf(day);
  const toMinutes = (hhmm: string) => {
    const [hours, minutes] = hhmm.split(":").map(Number);
    return hours * MINUTES_PER_HOUR + minutes;
  };
  return ranges
    .filter((range) => range.weekday === weekday)
    .map((range) => ({ from: toMinutes(range.start_time), to: toMinutes(range.end_time) }))
    .sort((a, b) => a.from - b.from);
}

// Un instante como minutos desde la medianoche de `dayStart`, sin salirse del día.
export const minuteOfDay = (instant: number, dayStart: number) =>
  Math.min(MINUTES_PER_DAY, Math.max(0, Math.round((instant - dayStart) / MS_PER_MINUTE)));

function buildBands(open: Span[], from: number, to: number): Band[] {
  if (open.length === 0) {
    return [{ kind: "closed", from, to }];
  }
  const bands: Band[] = [];
  if (open[0].from > from) {
    bands.push({ kind: "closed", from, to: open[0].from });
  }
  open.slice(1).forEach((span, index) => {
    if (span.from > open[index].to) {
      bands.push({ kind: "lunch", from: open[index].to, to: span.from });
    }
  });
  const last = open[open.length - 1];
  if (last.to < to) {
    bands.push({ kind: "closed", from: last.to, to });
  }
  return bands;
}

// Pasado / en curso / después según `now`. En otro día no hay "ahora": un día anterior ya pasó
// y uno posterior viene después.
function statusOf(item: AgendaItem, day: string, now: Date): BlockStatus {
  const today = dateInBuenosAires(now);
  if (day !== today) {
    return day < today ? "past" : "later";
  }
  if (Date.parse(item.endsAt) <= now.getTime()) {
    return "past";
  }
  return Date.parse(item.startsAt) <= now.getTime() ? "current" : "later";
}

// Arma lo que la pantalla dibuja: la ventana (los horarios del día, agrandada hasta cubrir
// cualquier turno fuera de ellos), las franjas cerradas y de almuerzo, la posición de cada turno o
// bloqueo y dónde está ahora. Como la base no deja que dos se pisen, no hace falta repartirlos en
// columnas. El siguiente es el primer turno que viene si no hay uno en curso; un bloqueo no cuenta.
export function buildTimeline(
  day: string,
  items: AgendaItem[],
  ranges: HourRange[],
  now: Date,
): Timeline {
  const dayStart = Date.parse(dayBounds(day).from);
  const open = openSpans(day, ranges);
  const blocks: TimelineBlock[] = items.map((item) => ({
    item,
    startMinute: minuteOfDay(Date.parse(item.startsAt), dayStart),
    endMinute: minuteOfDay(Date.parse(item.endsAt), dayStart),
    status: statusOf(item, day, now),
  }));

  const hasCurrent = blocks.some(
    ({ item, status }) => item.kind === "appointment" && status === "current",
  );
  const nextIndex = hasCurrent
    ? -1
    : blocks.findIndex(
        ({ item, status }) => item.kind === "appointment" && status === "later",
      );
  const isToday = dateInBuenosAires(now) === day;
  if (nextIndex >= 0 && isToday) {
    blocks[nextIndex] = { ...blocks[nextIndex], status: "next" };
  }

  const edges = [
    ...open.flatMap(({ from, to }) => [from, to]),
    ...blocks.flatMap(({ startMinute, endMinute }) => [startMinute, endMinute]),
  ];
  const fromMinute =
    edges.length === 0
      ? DEFAULT_WINDOW.from
      : Math.floor(Math.min(...edges) / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
  const toMinute =
    edges.length === 0
      ? DEFAULT_WINDOW.to
      : Math.ceil(Math.max(...edges) / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;

  const nowMinute = isToday ? minuteOfDay(now.getTime(), dayStart) : null;
  return {
    fromMinute,
    toMinute,
    bands: buildBands(open, fromMinute, toMinute),
    blocks,
    nowMinute: nowMinute !== null && nowMinute >= fromMinute && nowMinute <= toMinute ? nowMinute : null,
  };
}
