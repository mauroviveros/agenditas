import { z } from "zod";
import type { Database } from "../supabase/database.types.ts";

// Sin imports con alias (`@/`): lo usa también scripts/holidays-sync.ts, que corre con
// Node directo y no resuelve alias.
// Los valores salen del enum de la base (supabase/migrations), no se repiten a mano.
export type HolidayKind = Database["public"]["Enums"]["holiday_kind"];

export interface HolidayRow {
  date: string;
  name: string;
  kind: HolidayKind;
}

// Los tipos de ArgentinaDatos y los que guarda la tabla (los mismos del CHECK). Un Map y no
// un objeto: en un objeto, un tipo como "constructor" encontraría lo que todo objeto hereda.
const KIND_BY_TYPE = new Map<string, HolidayKind>([
  ["inamovible", "fixed"],
  ["trasladable", "movable"],
  ["puente", "bridge"],
]);

const NAME_MAX = 120; // el mismo tope que holidays_name_check
const MAX_HOLIDAYS = 100; // un año trae unos veinte: más de cien es una respuesta rara

// Algunos nombres traen la fecha al final ("… (20/11)"): la fila ya la muestra.
const TRAILING_DATE = /\s*\(\d{1,2}\/\d{1,2}\)$/;

const apiSchema = z
  .array(
    z.object({
      fecha: z.iso.date(),
      nombre: z.string().trim().min(1).max(NAME_MAX),
      tipo: z.string(),
    }),
  )
  .max(MAX_HOLIDAYS);

// Respuesta de https://api.argentinadatos.com/v1/feriados/<año> → filas de `holidays`.
// Un tipo desconocido o un feriado de otro año cortan la carga: callarlos dejaría datos
// raros (o feriados sin cargar) sin que nadie se entere.
export function parseHolidays(json: unknown, year: number): HolidayRow[] {
  const byDate = new Map<string, HolidayRow>();
  for (const { fecha, nombre, tipo } of apiSchema.parse(json)) {
    const kind = KIND_BY_TYPE.get(tipo);
    if (!kind) {
      throw new Error(`Tipo de feriado desconocido: "${tipo}" (${fecha}, ${nombre}).`);
    }
    if (!fecha.startsWith(`${year}-`)) {
      throw new Error(`Feriado fuera del año ${year}: ${fecha} (${nombre}).`);
    }
    if (!byDate.has(fecha)) {
      byDate.set(fecha, { date: fecha, name: nombre.replace(TRAILING_DATE, "") || nombre, kind });
    }
  }
  return [...byDate.values()];
}
