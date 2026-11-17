import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export async function getSession(): Promise<Session | null> {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function sendMagicLink(email: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
  });
  if (error) throw error;
}

export async function confirmMagicLink(tokenHash: string): Promise<void> {
  const { error } = await getSupabase().auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });
  if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

// Google se muestra solo cuando el proyecto lo tiene activado (ver ROADMAP, R1).
export const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_ENABLED === "true";
