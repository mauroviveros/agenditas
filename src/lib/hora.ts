export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Muestra un instante como "HH:mm" en la hora de Buenos Aires. */
export function formatearHora(instante: Date): string {
  return formatoHora.format(instante);
}

const formatoDia = new Intl.DateTimeFormat("en-US", { timeZone: ZONA_HORARIA, weekday: "short" });
const DIAS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Día de la semana en Buenos Aires, contado desde el lunes: 0 = lunes … 6 = domingo. */
export function weekdayIndex(instante: Date): number {
  return DIAS.indexOf(formatoDia.format(instante));
}

// en-CA da AAAA-MM-DD.
const formatoFechaIso = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA });

/** El día de un instante en Buenos Aires, como "AAAA-MM-DD". */
export function fechaEnBuenosAires(instante: Date): string {
  return formatoFechaIso.format(instante);
}

// Una fecha sin hora ("2026-05-25") se arma y se muestra en UTC para que ninguna zona
// horaria la corra de día.
const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Una fecha "AAAA-MM-DD" como "lunes 25 de mayo". */
export function formatearFecha(fecha: string): string {
  return formatoFecha.format(new Date(`${fecha}T00:00:00Z`)).replace(",", "");
}
