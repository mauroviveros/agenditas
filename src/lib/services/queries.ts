import { createClient } from "@/lib/supabase/server";

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}

// Sus servicios activos (los archivados no se ven), del más viejo al más nuevo. La RLS deja ver
// solo los propios.
export async function getMyServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .is("archived_at", null)
    .order("created_at")
    .order("id");
  if (error) {
    throw new Error(`No pudimos leer los servicios: ${error.message}`);
  }
  return data;
}
