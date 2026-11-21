import { createClient } from "@/lib/supabase/server";

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}

const COLUMNS = "id, name, duration_minutes, price_cents";

// Sus servicios activos, del más viejo al más nuevo. La RLS deja ver solo los propios.
export async function getMyServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(COLUMNS)
    .is("archived_at", null)
    .order("created_at")
    .order("id");
  if (error) {
    throw new Error(`No pudimos leer los servicios: ${error.message}`);
  }
  return data;
}

// Los archivados (los que se «borraron»), el último archivado primero: se pueden restaurar.
export async function getMyArchivedServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(COLUMNS)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false })
    .order("id");
  if (error) {
    throw new Error(`No pudimos leer los servicios archivados: ${error.message}`);
  }
  return data;
}
