export const TIME_ZONE = "America/Argentina/Buenos_Aires";

const timeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Muestra un instante como "HH:mm" en la hora de Buenos Aires. */
export function formatTime(instant: Date): string {
  return timeFormat.format(instant);
}

const weekdayFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Día de la semana en Buenos Aires, contado desde el lunes: 0 = lunes … 6 = domingo. */
export function weekdayIndex(instant: Date): number {
  return WEEKDAYS.indexOf(weekdayFormat.format(instant));
}

// en-CA da AAAA-MM-DD.
const isoDateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** El día de un instante en Buenos Aires, como "AAAA-MM-DD". */
export function dateInBuenosAires(instant: Date): string {
  return isoDateFormat.format(instant);
}

// Una fecha sin hora ("2026-05-25") se arma y se muestra en UTC para que ninguna zona
// horaria la corra de día.
const dateFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Una fecha "AAAA-MM-DD" como "lunes 25 de mayo". */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T00:00:00Z`)).replace(",", "");
}
