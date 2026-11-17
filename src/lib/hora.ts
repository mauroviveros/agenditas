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
