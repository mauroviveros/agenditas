import { readSupabaseConfig } from "@agenditas/db";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ENV_NAMES = {
  url: "VITE_SUPABASE_URL",
  publishableKey: "VITE_SUPABASE_PUBLISHABLE_KEY",
};

let client: SupabaseClient | undefined;

// Perezoso: leer las variables al importar rompería los tests y las pantallas
// que todavía no hablan con la base. La RLS es el guardia real (ver ARQUITECTURA).
export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, publishableKey } = readSupabaseConfig(
      import.meta.env,
      ENV_NAMES,
    );
    client = createClient(url, publishableKey);
  }
  return client;
}
