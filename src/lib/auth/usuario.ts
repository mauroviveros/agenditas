import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// La verificación real de sesión del panel. Va dentro de <Suspense>: lee cookies.
export async function getUsuario() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/ingresar");
  return { id: data.claims.sub, email: data.claims.email ?? "" };
}
