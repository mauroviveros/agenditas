const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"] as const;
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;
const DAYS_IN_WEEK = 7;
const MS_PER_DAY = 86_400_000;

export interface WeekDay {
  weekday: (typeof WEEKDAYS)[number];
  day: number;
  isToday: boolean;
}

// Año, mes y día en la zona del negocio: en UTC, después de las 21:00 en Argentina
// ya sería "mañana".
function localDate(date: Date, timeZone: string): number {
  const [year = 0, month = 1, day = 1] = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-")
    .map(Number);
  return Date.UTC(year, month - 1, day);
}

export function weekOf(date: Date, timeZone: string): WeekDay[] {
  const today = localDate(date, timeZone);
  const mondayIndex = (new Date(today).getUTCDay() + 6) % DAYS_IN_WEEK;
  return WEEKDAYS.map((weekday, index) => ({
    weekday,
    day: new Date(today + (index - mondayIndex) * MS_PER_DAY).getUTCDate(),
    isToday: index === mondayIndex,
  }));
}

export function monthName(date: Date, timeZone: string): string {
  return MONTHS[new Date(localDate(date, timeZone)).getUTCMonth()] ?? "";
}
