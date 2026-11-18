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
