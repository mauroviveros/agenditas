import { env } from "cloudflare:workers";
import { readSupabaseConfig } from "@agenditas/db";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ENV_NAMES = {
  url: "SUPABASE_URL",
  publishableKey: "SUPABASE_PUBLISHABLE_KEY",
};

// Un cliente por request: en el Worker no se comparte estado entre usuarios.
// Sin sesión ni cookies: la web pública lee como `anon` y nunca toca Auth.
export function createServerSupabase(): SupabaseClient {
  const { url, publishableKey } = readSupabaseConfig(env, ENV_NAMES);
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
