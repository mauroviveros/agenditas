import { randomUUID } from "node:crypto";
import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";

// Crea un solista de prueba con email y contraseña (provider prendido solo en local)
// y, si se pasa un contexto, deja su sesión en las cookies del navegador con el
// mismo formato que usa la app.
export async function signUpNewUser(context?: BrowserContext) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_* for e2e (see .env.example)");
  }

  const cookies = new Map<string, string>();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          cookies.set(name, value);
        }
      },
    },
  });

  const { error } = await supabase.auth.signUp({
    email: `solista-${randomUUID()}@test.local`,
    password: randomUUID(),
  });
  if (error) {
    throw new Error(`e2e sign up failed: ${error.message}`);
  }

  if (context) {
    await context.addCookies(
      [...cookies].map(([name, value]) => ({ name, value, domain: "localhost", path: "/" })),
    );
  }
  return supabase;
}
