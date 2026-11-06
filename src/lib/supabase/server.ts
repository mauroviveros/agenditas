import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "./types";

// httpOnly: el navegador no lee la sesión (no hay cliente de navegador). Lo usa también el proxy.
// Si la rebanada 7 suma Realtime, pasarle el token al cliente en vez de abrir la cookie.
export const cookieOptions = { httpOnly: true };

// Uno nuevo por request: los headers de no-cache llegan solo en la primera escritura de cookies.
export async function createClient() {
  // El cliente lee Date.now() al crearse; con Cache Components eso tiene que ser en el request.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components no pueden escribir cookies; el proxy ya refrescó la sesión.
          }
        },
      },
    },
  );
}
