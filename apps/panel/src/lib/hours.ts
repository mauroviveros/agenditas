import { queryOptions } from "@tanstack/react-query";
import type { HoursPayload, WeeklyHoursRow } from "./schedule";
import { getSupabase } from "./supabase";

export const weeklyHoursQuery = queryOptions({
  queryKey: ["weekly-hours"],
  queryFn: async (): Promise<WeeklyHoursRow[]> => {
    const { data, error } = await getSupabase()
      .from("weekly_hours")
      .select("weekday, opens, closes, lunch_starts, lunch_ends")
      .order("weekday");
    if (error) throw error;
    return data;
  },
});

// Una sola RPC: la semana se guarda entera o no cambia nada.
export async function saveWeeklyHours(days: HoursPayload[]): Promise<void> {
  const { error } = await getSupabase().rpc("save_weekly_hours", {
    p_hours: days,
  });
  if (error) throw error;
}
