import { queryOptions } from "@tanstack/react-query";
import { getSupabase } from "./supabase";

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_ars: number | null;
}

export interface ServiceInput {
  name: string;
  duration_minutes: number;
  price_ars: number | null;
}

const COLUMNS = "id, name, duration_minutes, price_ars";

// La RLS deja ver solo los del negocio propio; los archivados no se listan.
export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await getSupabase()
      .from("services")
      .select(COLUMNS)
      .is("archived_at", null)
      .order("name");
    if (error) throw error;
    return data;
  },
});

export async function createService(
  businessId: string,
  input: ServiceInput,
): Promise<void> {
  const { error } = await getSupabase()
    .from("services")
    .insert({ business_id: businessId, ...input });
  if (error) throw error;
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<void> {
  const { error } = await getSupabase()
    .from("services")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function archiveService(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("services")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
