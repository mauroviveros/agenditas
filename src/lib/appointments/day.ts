import { z } from "zod";

const daySchema = z.iso.date();

// El día que se mira: el de la URL (?dia=AAAA-MM-DD) si es una fecha que existe; si falta, está
// repetido o es cualquier otra cosa, hoy. Nunca falla: una URL vieja o mal escrita no rompe la pantalla.
export function resolveDay(raw: unknown, today: string): string {
  const parsed = daySchema.safeParse(raw);
  return parsed.success ? parsed.data : today;
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

// El día de al lado ("AAAA-MM-DD"), hacia atrás (-1) o adelante (+1).
export function shiftDay(day: string, delta: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + delta)).toISOString().slice(0, 10);
}

// El instante (UTC, ISO) de una hora de pared de Buenos Aires: "2027-03-01" y "14:45" son las
// 14:45 de ese día allá, que en UTC son las 17:45.
export function startsAtOf(day: string, time: string): string {
  const offset = `-${String(BUENOS_AIRES_OFFSET_HOURS).padStart(2, "0")}:00`;
  return new Date(`${day}T${time}:00${offset}`).toISOString();
}
