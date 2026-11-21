import { z } from "zod";

const daySchema = z.iso.date();

// El día que se mira: el de la URL (?dia=AAAA-MM-DD) si es una fecha que existe; si falta, está
// repetido o es cualquier otra cosa, hoy. Nunca falla: una URL vieja o mal escrita no rompe la pantalla.
export function resolveDay(raw: unknown, today: string): string {
  const parsed = daySchema.safeParse(raw);
  return parsed.success ? parsed.data : today;
}

// El día de al lado ("AAAA-MM-DD"), hacia atrás (-1) o adelante (+1).
export function shiftDay(day: string, delta: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + delta)).toISOString().slice(0, 10);
}
