import { queryOptions } from "@tanstack/react-query";

// API pública de feriados de Argentina. No se guardan en la base: el panel los lee.
const HOLIDAYS_URL = "https://api.argentinadatos.com/v1/feriados";
const ONE_DAY_MS = 86_400_000;
const UPCOMING_LIMIT = 6;

export interface Holiday {
  date: string;
  name: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Se queda con las entradas bien formadas; una rota no tira abajo la lista. */
export function parseHolidays(payload: unknown): Holiday[] {
  if (!Array.isArray(payload)) throw new Error("holidays_bad_response");
  return payload.flatMap((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { fecha, nombre } = entry as Record<string, unknown>;
    if (typeof fecha !== "string" || !ISO_DATE.test(fecha)) return [];
    if (typeof nombre !== "string" || nombre.trim() === "") return [];
    return [{ date: fecha, name: nombre.trim() }];
  });
}

/** Los próximos feriados desde hoy (incluido), en orden y sin repetir fecha. */
export function upcomingHolidays(
  holidays: readonly Holiday[],
  today: string,
  limit: number = UPCOMING_LIMIT,
): Holiday[] {
  const seen = new Set<string>();
  return [...holidays]
    .filter((holiday) => holiday.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((holiday) => {
      if (seen.has(holiday.date)) return false;
      seen.add(holiday.date);
      return true;
    })
    .slice(0, limit);
}

async function fetchYear(year: number): Promise<Holiday[]> {
  const response = await fetch(`${HOLIDAYS_URL}/${year}`);
  if (!response.ok) throw new Error("holidays_unavailable");
  return parseHolidays(await response.json());
}

/** Este año y el que viene: alcanza para ver los próximos feriados en diciembre. */
export function holidaysQuery(year: number) {
  return queryOptions({
    queryKey: ["holidays", year],
    queryFn: async () => {
      const [thisYear, nextYear] = await Promise.all([
        fetchYear(year),
        fetchYear(year + 1),
      ]);
      return [...thisYear, ...nextYear];
    },
    staleTime: ONE_DAY_MS,
    retry: 1,
  });
}
