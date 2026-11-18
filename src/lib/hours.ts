import { z } from "zod";

// Las mismas reglas que business_hours y set_business_hours: la pantalla avisa antes de
// llegar a la base, y la base sigue siendo la última palabra. Las claves van en
// snake_case porque son las de la RPC y pasan tal cual.
const WEEKDAY_MIN = 1; // lunes
const WEEKDAY_MAX = 7; // domingo
// Una semana con varias franjas por día entra de sobra; es el tope de la RPC.
export const MAX_RANGES = 70;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = z.string().regex(TIME_PATTERN, "Poné la hora como HH:mm, por ejemplo 09:30.");

const rangeSchema = z
  .object({
    weekday: z.number().int().min(WEEKDAY_MIN).max(WEEKDAY_MAX),
    start_time: timeSchema,
    end_time: timeSchema,
  })
  // "HH:mm" se ordena igual como texto que como hora.
  .refine((range) => range.end_time > range.start_time, {
    message: "El fin tiene que ser después del inicio.",
    path: ["end_time"],
  });

export type HourRange = z.infer<typeof rangeSchema>;

// La semana entera: una franja por tramo de atención. El almuerzo es el hueco entre dos.
export const hoursSchema = z
  .array(rangeSchema)
  .max(MAX_RANGES, `Una semana puede tener hasta ${MAX_RANGES} franjas.`)
  .superRefine((ranges, context) => {
    const byStart = ranges
      .map((range, index) => ({ range, index }))
      .sort((a, b) => a.range.start_time.localeCompare(b.range.start_time));
    const lastEnd = new Map<number, string>();
    for (const { range, index } of byStart) {
      const previousEnd = lastEnd.get(range.weekday);
      // Pegadas (una termina donde arranca la otra) no se pisan.
      if (previousEnd !== undefined && range.start_time < previousEnd) {
        // Señala la que arranca más tarde: es la que entra en el tramo de la otra.
        context.addIssue({
          code: "custom",
          message: "Hay dos franjas del mismo día que se pisan.",
          path: [index, "start_time"],
        });
        return;
      }
      lastEnd.set(range.weekday, range.end_time);
    }
  });

const DEFAULT_START = "09:00";
const DEFAULT_SLOT_HOURS = 4;
const LAST_MINUTE = "23:59";

// Franja que se propone al tocar "Agregar franja": sigue a la anterior del día (o arranca
// a las 09:00) y dura cuatro horas sin pasar de las 23:59. El solista la ajusta.
export function defaultSlotAfter(previousEnd: string | undefined): {
  start_time: string;
  end_time: string;
} {
  const start = previousEnd ?? DEFAULT_START;
  const [hours = 0, minutes = 0] = start.split(":").map(Number);
  const endHours = hours + DEFAULT_SLOT_HOURS;
  const end =
    endHours > 23
      ? LAST_MINUTE
      : `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { start_time: start, end_time: end };
}

interface HourRow {
  weekday: number;
  start_time: string;
  end_time: string;
}

// Postgres devuelve la hora con segundos ("09:00:00"); la pantalla trabaja con "09:00".
export function toHourRange(row: HourRow): HourRange {
  return {
    weekday: row.weekday,
    start_time: row.start_time.slice(0, 5),
    end_time: row.end_time.slice(0, 5),
  };
}
