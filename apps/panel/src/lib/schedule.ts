import { formatTime } from "@agenditas/db";

export const WEEKDAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

const STEP_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_OPENS = "09:00";
const DEFAULT_CLOSES = "18:00";
const DEFAULT_LUNCH_STARTS = "13:00";
const DEFAULT_LUNCH_ENDS = "14:00";

export interface WeeklyHoursRow {
  weekday: number;
  opens: string;
  closes: string;
  lunch_starts: string | null;
  lunch_ends: string | null;
}

export interface DayDraft {
  weekday: number;
  open: boolean;
  opens: string;
  closes: string;
  lunch: boolean;
  lunchStarts: string;
  lunchEnds: string;
}

export interface HoursPayload {
  weekday: number;
  opens: string;
  closes: string;
  lunch_starts: string | null;
  lunch_ends: string | null;
}

/** Todas las horas de pared en pasos de 15 minutos, de 00:00 a 23:45. */
export const TIME_OPTIONS: readonly string[] = Array.from(
  { length: MINUTES_PER_DAY / STEP_MINUTES },
  (_, index) => {
    const minutes = index * STEP_MINUTES;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  },
);

function closedDay(weekday: number): DayDraft {
  return {
    weekday,
    open: false,
    opens: DEFAULT_OPENS,
    closes: DEFAULT_CLOSES,
    lunch: false,
    lunchStarts: DEFAULT_LUNCH_STARTS,
    lunchEnds: DEFAULT_LUNCH_ENDS,
  };
}

/** Los siete días, de lunes (1) a domingo (7), con lo que haya guardado. */
export function draftsFromRows(rows: readonly WeeklyHoursRow[]): DayDraft[] {
  return WEEKDAY_LABELS.map((_, index) => {
    const weekday = index + 1;
    const row = rows.find((candidate) => candidate.weekday === weekday);
    if (!row) return closedDay(weekday);
    const hasLunch = row.lunch_starts !== null && row.lunch_ends !== null;
    return {
      weekday,
      open: true,
      opens: formatTime(row.opens),
      closes: formatTime(row.closes),
      lunch: hasLunch,
      lunchStarts: row.lunch_starts
        ? formatTime(row.lunch_starts)
        : DEFAULT_LUNCH_STARTS,
      lunchEnds: row.lunch_ends
        ? formatTime(row.lunch_ends)
        : DEFAULT_LUNCH_ENDS,
    };
  });
}

/** El texto del problema de un día, o `null` si está bien. Las horas son `HH:MM`. */
export function validateDay(day: DayDraft): string | null {
  if (!day.open) return null;
  if (day.opens >= day.closes) return "Tiene que cerrar después de abrir.";
  if (!day.lunch) return null;
  if (day.lunchStarts >= day.lunchEnds)
    return "El almuerzo tiene que terminar después de empezar.";
  if (day.lunchStarts <= day.opens || day.lunchEnds >= day.closes)
    return "El almuerzo tiene que quedar adentro del horario.";
  return null;
}

/** Lo que recibe `save_weekly_hours`: solo los días abiertos. */
export function hoursPayload(days: readonly DayDraft[]): HoursPayload[] {
  return days
    .filter((day) => day.open)
    .map((day) => ({
      weekday: day.weekday,
      opens: day.opens,
      closes: day.closes,
      lunch_starts: day.lunch ? day.lunchStarts : null,
      lunch_ends: day.lunch ? day.lunchEnds : null,
    }));
}
