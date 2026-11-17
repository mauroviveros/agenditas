import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "./env";

let client: SupabaseClient | undefined;

// Perezoso: leer las variables al importar rompería los tests y las pantallas
// que todavía no hablan con la base. La RLS es el guardia real (ver ARQUITECTURA).
export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, publishableKey } = readSupabaseConfig(import.meta.env);
    client = createClient(url, publishableKey);
  }
  return client;
}
