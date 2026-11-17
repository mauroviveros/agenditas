import { queryOptions } from "@tanstack/react-query";
import { getSupabase } from "./supabase";

export interface DayOverride {
  on_date: string;
  kind: "closed" | "open";
  note: string | null;
}

export const overridesQuery = queryOptions({
  queryKey: ["day-overrides"],
  queryFn: async (): Promise<DayOverride[]> => {
    const { data, error } = await getSupabase()
      .from("day_overrides")
      .select("on_date, kind, note")
      .order("on_date");
    if (error) throw error;
    return data;
  },
});

// Un solo insert: si un día falla (ya cargado, en el pasado), no queda ninguno.
export async function addOverrides(
  businessId: string,
  dates: readonly string[],
  kind: DayOverride["kind"],
  note: string | null,
): Promise<void> {
  const { error } = await getSupabase()
    .from("day_overrides")
    .insert(
      dates.map((on_date) => ({
        business_id: businessId,
        on_date,
        kind,
        note,
      })),
    );
  if (error) throw error;
}

export async function removeOverrides(dates: readonly string[]): Promise<void> {
  const { error } = await getSupabase()
    .from("day_overrides")
    .delete()
    .in("on_date", [...dates]);
  if (error) throw error;
}
