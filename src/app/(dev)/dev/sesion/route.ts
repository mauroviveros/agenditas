import { createClient } from "@/lib/supabase/server";

// Prueba de humo de la sesión: devuelve los claims o null.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return Response.json({
    claims: data?.claims ?? null,
    error: error?.message ?? null,
  });
}
