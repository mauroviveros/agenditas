import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Cliente de Supabase con la sesión del usuario: para Server Components,
// Server Actions y Route Handlers. La RLS aplica con sus permisos.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
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
