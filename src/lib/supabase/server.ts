import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

// Cliente de Supabase con la sesión del usuario: para Server Components,
// Server Actions y Route Handlers. La RLS aplica con sus permisos.
export async function createClient() {
  const cookieStore = await cookies();
  // La sesión de Supabase lee la hora al iniciar: se pospone al pedido real, nunca al prerender.
  await connection();
  const { url, key } = getSupabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies; la sesión la refresca
          // el proxy en cada pedido, así que acá no se pierde nada.
        }
      },
    },
  });
}
