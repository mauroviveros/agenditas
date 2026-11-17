"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Arranca el login con Google: Supabase arma la URL (con PKCE) y mandamos ahí.
// No recibe datos del usuario. Si el origin no está en la lista permitida de
// Supabase, Supabase vuelve al site_url: no se puede usar para redirigir afuera.
export async function signInWithGoogle(): Promise<never> {
  const origin = (await headers()).get("origin");
  if (!origin) {
    redirect("/login?error=oauth");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    console.error("login: could not start google oauth", error);
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}
