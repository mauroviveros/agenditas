import { createClient } from "@/lib/supabase/server";
import { type HourRange, toHourRange } from "./schema";

// Sus franjas de atención, de lunes a domingo. La RLS deja ver solo las propias.
export async function getMyHours(): Promise<HourRange[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("weekday, start_time, end_time")
    .order("weekday")
    .order("start_time");
  if (error) {
    throw new Error(`No pudimos leer los horarios: ${error.message}`);
  }
  return data.map(toHourRange);
}
