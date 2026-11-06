import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// La verificación real de sesión del panel. Va dentro de <Suspense>: lee cookies.
// Con cache() el layout y cada página que lee datos la llaman sin repetir el trabajo.
export const getUsuario = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/ingresar");
  return { id: data.claims.sub, email: data.claims.email ?? "" };
});
