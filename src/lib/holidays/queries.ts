import { fechaEnBuenosAires } from "@/lib/hora";
import { createClient } from "@/lib/supabase/server";
import type { HolidayRow } from "./parse";

const UPCOMING_HOLIDAYS = 5;

// Los próximos feriados desde hoy (en Buenos Aires, hoy incluido). Lectura pública por RLS.
export async function getUpcomingHolidays(): Promise<HolidayRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("holidays")
    .select("date, name, kind")
    .gte("date", fechaEnBuenosAires(new Date()))
    .order("date")
    .limit(UPCOMING_HOLIDAYS);
  if (error) {
    throw new Error(`No pudimos leer los feriados: ${error.message}`);
  }
  return data as HolidayRow[];
}
