const TIME_ZONE = "America/Argentina/Buenos_Aires";

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

/**
 * Una fecha "AAAA-MM-DD" como "lunes 25 de mayo". `today` es el día de hoy en el mismo
 * formato: si la fecha es de otro año, se le agrega ("viernes 1 de enero de 2027").
 */
export function formatDate(date: string, today: string): string {
  const text = dateFormat.format(new Date(`${date}T00:00:00Z`)).replace(",", "");
  const year = date.slice(0, 4);
  return year === today.slice(0, 4) ? text : `${text} de ${year}`;
}

const timeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** La hora de un instante ISO en Buenos Aires, en 24 h ("10:00"). */
export function formatTime(instant: string): string {
  return timeFormat.format(new Date(instant));
}

/** Cuánto falta, de menos de una hora a varias: "28 min", "1 h 13 min", "2 h". */
export function formatUntil(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Argentina no tiene horario de verano: Buenos Aires es siempre UTC-3.
// shortcut: desfase fijo, si algún día vuelve el horario de verano pasar a Temporal o a una
// librería de fechas.
const BUENOS_AIRES_OFFSET_HOURS = 3;

// Desde la medianoche de Buenos Aires hasta la del día siguiente, como instantes ISO (UTC) para
// filtrar timestamptz.
export function dayBounds(day: string): { from: string; to: string } {
  const [year, month, date] = day.split("-").map(Number);
  const at = (dayOfMonth: number) =>
    new Date(Date.UTC(year, month - 1, dayOfMonth, BUENOS_AIRES_OFFSET_HOURS)).toISOString();
  return { from: at(date), to: at(date + 1) };
}

// El instante (UTC, ISO) de una hora de pared de Buenos Aires: "2027-03-01" y "14:45" son las
// 14:45 de ese día allá, que en UTC son las 17:45.
export function startsAtOf(day: string, time: string): string {
  const offset = `-${String(BUENOS_AIRES_OFFSET_HOURS).padStart(2, "0")}:00`;
  return new Date(`${day}T${time}:00${offset}`).toISOString();
}
