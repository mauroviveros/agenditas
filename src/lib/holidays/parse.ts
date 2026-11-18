import { z } from "zod";

// Sin imports con alias (`@/`): lo usa también scripts/holidays-sync.ts, que corre con
// Node directo y no resuelve alias.
export type HolidayKind = "fixed" | "movable" | "bridge";

export interface HolidayRow {
  date: string;
  name: string;
  kind: HolidayKind;
}

// Los tipos de ArgentinaDatos y los que guarda la tabla (los mismos del CHECK).
const KIND_BY_TYPE: Record<string, HolidayKind> = {
  inamovible: "fixed",
  trasladable: "movable",
  puente: "bridge",
};

const NAME_MAX = 120; // el mismo tope que holidays_name_check

const apiSchema = z.array(
  z.object({
    fecha: z.iso.date(),
    nombre: z.string().trim().min(1).max(NAME_MAX),
    tipo: z.string(),
  }),
);

// Respuesta de https://api.argentinadatos.com/v1/feriados/<año> → filas de `holidays`.
// Un tipo desconocido corta la carga: callarlo dejaría feriados sin cargar sin que nadie
// se entere.
export function parseHolidays(json: unknown): HolidayRow[] {
  const byDate = new Map<string, HolidayRow>();
  for (const { fecha, nombre, tipo } of apiSchema.parse(json)) {
    const kind = KIND_BY_TYPE[tipo];
    if (!kind) {
      throw new Error(`Tipo de feriado desconocido: "${tipo}" (${fecha}, ${nombre}).`);
    }
    if (!byDate.has(fecha)) {
      byDate.set(fecha, { date: fecha, name: nombre, kind });
    }
  }
  return [...byDate.values()];
}
