import type { HourRange } from "@/lib/hours/schema";

// La semana como la ve la pantalla: siete días (0 = lunes … 6 = domingo), cada uno con
// sus franjas. El almuerzo no se guarda: es el hueco entre dos franjas.
export type Slot = Pick<HourRange, "start_time" | "end_time">;
export type Week = readonly (readonly Slot[])[];

export const WEEKDAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

const DAYS = WEEKDAY_NAMES.length;

// Agrupa las franjas por día y las ordena por hora de inicio.
export function weekFromRanges(ranges: readonly HourRange[]): Week {
  return Array.from({ length: DAYS }, (_, day) =>
    ranges
      .filter((range) => range.weekday === day + 1)
      .map(({ start_time, end_time }) => ({ start_time, end_time }))
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  );
}

// Lo que se manda a guardar: lunes primero, cada día en el orden en que está en pantalla.
export function rangesFromWeek(week: Week): HourRange[] {
  return week.flatMap((slots, day) =>
    slots.map((slot) => ({ weekday: day + 1, ...slot })),
  );
}

// Lunes a viernes, para "usar este horario de lunes a viernes".
export const WORKWEEK = [0, 1, 2, 3, 4] as const;
// Los siete días, para "usar este horario toda la semana".
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
// Un día tiene una franja corrida o dos (el hueco entre ellas es el almuerzo).
export const MAX_SLOTS_PER_DAY = 2;

const OPEN_AT = "09:00";
const CLOSE_AT = "18:00";
const LUNCH_MINUTES = 60;
const DEFAULT_LUNCH_START = 13 * 60;
// Menos que esto no entra una franja de cada lado del almuerzo.
const MIN_MINUTES_TO_SPLIT = 2 * 60;

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

// Abre un día cerrado (de 09:00 a 18:00) o cierra uno abierto.
export function toggleDay(week: Week, day: number): Week {
  const isOpen = (week[day] ?? []).length > 0;
  const next: readonly Slot[] = isOpen
    ? []
    : [{ start_time: OPEN_AT, end_time: CLOSE_AT }];
  return week.map((slots, index) => (index === day ? next : slots));
}

// Reemplaza las franjas de un día y deja los demás como están.
export const replaceDay = (week: Week, day: number, slots: readonly Slot[]): Week =>
  week.map((current, index) => (index === day ? slots : current));

// Corta una franja corrida en dos con una hora de almuerzo: de 13 a 14 si cabe, si no
// cerca de la mitad.
export function splitLunch(slots: readonly Slot[]): readonly Slot[] {
  const [only] = slots;
  if (slots.length !== 1 || !only) {
    return slots;
  }
  const start = toMinutes(only.start_time);
  const end = toMinutes(only.end_time);
  if (end - start < MIN_MINUTES_TO_SPLIT) {
    return slots;
  }
  const fitsDefault =
    start < DEFAULT_LUNCH_START && end > DEFAULT_LUNCH_START + LUNCH_MINUTES;
  const lunchStart = fitsDefault
    ? DEFAULT_LUNCH_START
    : Math.round((start + end) / 120) * 60;
  const afterLunch = lunchStart + LUNCH_MINUTES;
  // Si el almuerzo se come toda la segunda franja, no hay de dónde cortar.
  if (afterLunch >= end) {
    return slots;
  }
  return [
    { start_time: only.start_time, end_time: fromMinutes(lunchStart) },
    { start_time: fromMinutes(afterLunch), end_time: only.end_time },
  ];
}

// Saca el almuerzo: une las dos franjas en una sola.
export function joinLunch(slots: readonly Slot[]): readonly Slot[] {
  const [first, second] = slots;
  if (slots.length !== MAX_SLOTS_PER_DAY || !first || !second) {
    return slots;
  }
  return [{ start_time: first.start_time, end_time: second.end_time }];
}

const slotMinutes = (slot: Slot) =>
  Math.max(0, toMinutes(slot.end_time) - toMinutes(slot.start_time));

// "8 h", "7 h 30".
function formatMinutes(total: number): string {
  const minutes = total % 60;
  return `${Math.floor(total / 60)} h${minutes ? ` ${String(minutes).padStart(2, "0")}` : ""}`;
}

// Cuánto se atiende en la semana, sin contar el almuerzo: "39 h", "7 h 30".
export function weekDuration(week: Week): string {
  return formatMinutes(
    week.flat().reduce((sum, slot) => sum + slotMinutes(slot), 0),
  );
}

// Lo mismo para un día; vacío si no atiende.
export function dayDuration(slots: readonly Slot[]): string {
  return slots.length === 0
    ? ""
    : formatMinutes(slots.reduce((sum, slot) => sum + slotMinutes(slot), 0));
}

// "09:00–13:00 · 14:00–17:00": el resumen de un día para la lista del celu.
export function summarizeDay(slots: readonly Slot[]): string {
  return slots.length === 0
    ? "No atiende"
    : slots.map((slot) => `${slot.start_time}–${slot.end_time}`).join(" · ");
}

// Copia las franjas de un día a otros, que pierden las que tenían. Es una copia de
// valores: después cada día se edita por su cuenta.
export function copyDay(week: Week, from: number, to: readonly number[]): Week {
  const source = week[from] ?? [];
  return week.map((slots, day) =>
    day !== from && to.includes(day)
      ? source.map((slot) => ({ ...slot }))
      : slots,
  );
}

// Lo que se le dice al solista después de copiar: de qué día y a cuáles.
export function copyMessage(dayName: string, to: readonly number[]): string {
  const target =
    to.length === ALL_DAYS.length ? "toda la semana" : "lunes a viernes";
  return `Copiamos el horario del ${dayName.toLowerCase()} a ${target}.`;
}
