import { dateInBuenosAires } from "@/lib/time";
import { dayBounds } from "./day";
import type { AgendaItem } from "./parse";
import { clock } from "./summary";
import { minuteOfDay } from "./timeline";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MS_PER_MINUTE = 60_000;
const SLOT_STEP = 15;
const TIME_STEP = 5;
const DEFAULT_START = 9 * MINUTES_PER_HOUR;
const LAST_START = MINUTES_PER_DAY - TIME_STEP;

const roundUp = (minute: number, step: number) => Math.ceil(minute / step) * step;

/** El minuto más cercano en pasos de `step` (el cuarto de hora, para un toque en la línea). */
export function snapMinute(minute: number, step = SLOT_STEP): number {
  return Math.round(minute / step) * step;
}

// La hora con la que abre el formulario de un turno nuevo: hoy, el próximo cuarto de hora; otro
// día, cuando abre (o las 09:00 si no atiende). Si cae sobre un turno o bloqueo, se corre hasta
// donde termina, y así hasta el primer hueco en que entra `minutes`. Nunca pasa de las 23:55.
export function suggestTime(
  day: string,
  items: AgendaItem[],
  open: { from: number; to: number }[],
  now: Date,
  minutes: number,
): string {
  const dayStart = Date.parse(dayBounds(day).from);
  const busy = items
    .map((item) => ({
      from: minuteOfDay(Date.parse(item.startsAt), dayStart),
      to: minuteOfDay(Date.parse(item.endsAt), dayStart),
    }))
    .sort((a, b) => a.from - b.from);

  const isToday = dateInBuenosAires(now) === day;
  let candidate = isToday
    ? roundUp(Math.round((now.getTime() - dayStart) / MS_PER_MINUTE), SLOT_STEP)
    : (open[0]?.from ?? DEFAULT_START);

  for (const block of busy) {
    if (candidate < block.to && candidate + minutes > block.from) {
      candidate = roundUp(block.to, TIME_STEP);
    }
  }
  return clock(Math.min(candidate, LAST_START));
}
