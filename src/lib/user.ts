import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

const text = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

// Quién está entrando. Lee cookies: usar siempre dentro de <Suspense>.
// cache: layout y página lo piden en el mismo render y no repiten la validación.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) {
    return null;
  }
  const email = claims.email ?? "";
  return {
    id: claims.sub,
    email,
    name: text(claims.user_metadata?.full_name) ?? text(claims.user_metadata?.name) ?? email,
    avatarUrl: text(claims.user_metadata?.avatar_url),
  };
});

export async function getUserId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}
