import { createClient } from "@/lib/supabase/server";
import type { HolidayRow } from "./parse";

const UPCOMING_HOLIDAYS = 5;

// Los próximos feriados desde `today` ("AAAA-MM-DD" en hora de Buenos Aires, hoy incluido).
// Lectura pública por RLS.
export async function getUpcomingHolidays(today: string): Promise<HolidayRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("holidays")
    .select("date, name, kind")
    .gte("date", today)
    .order("date")
    .limit(UPCOMING_HOLIDAYS);
  if (error) {
    throw new Error(`No pudimos leer los feriados: ${error.message}`);
  }
  return data;
}

// Los feriados entre dos días ("AAAA-MM-DD", los dos incluidos), por fecha. Lectura pública por RLS.
export async function getHolidaysBetween(from: string, to: string): Promise<HolidayRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("holidays")
    .select("date, name, kind")
    .gte("date", from)
    .lte("date", to)
    .order("date");
  if (error) {
    throw new Error(`No pudimos leer los feriados: ${error.message}`);
  }
  return data;
}
