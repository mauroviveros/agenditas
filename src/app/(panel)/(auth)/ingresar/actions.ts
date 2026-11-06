"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { mensajeDeError } from "@/lib/auth/errores";
import { createClient } from "@/lib/supabase/server";

export type EstadoIngresar = { error: string | null; email: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function callbackUrl() {
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  return `${origin}/auth/callback`;
}

export async function ingresarConEmail(
  _prev: EstadoIngresar,
  formData: FormData,
): Promise<EstadoIngresar> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email)) {
    return { error: mensajeDeError("email_invalido"), email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: await callbackUrl() },
  });
  if (error) return { error: mensajeDeError(error.code), email };

  redirect("/ingresar/revisa-tu-mail");
}

export async function ingresarConGoogle(): Promise<EstadoIngresar> {
  // signInWithOAuth solo arma la URL; si Google está apagado, Auth devolvería un JSON crudo.
  const ajustes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
      },
    },
  )
    .then((r) => r.json())
    .catch(() => null);
  if (!ajustes?.external?.google) {
    return { error: mensajeDeError("google_apagado"), email: "" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl() },
  });
  if (error) return { error: mensajeDeError(error.code), email: "" };

  redirect(data.url);
}

export async function salir() {
  const supabase = await createClient();
  // Solo este dispositivo; las otras sesiones siguen abiertas.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/ingresar");
}
