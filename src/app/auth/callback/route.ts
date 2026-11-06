import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recibe el link mágico (token_hash) y la vuelta de Google (code).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let codigoError = searchParams.get("error_code") ?? searchParams.get("error");

  if (!codigoError && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    codigoError = error ? (error.code ?? "error") : null;
  } else if (!codigoError && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    codigoError = error ? (error.code ?? "error") : null;
  } else if (!codigoError) {
    codigoError = "otp_expired";
  }

  const destino = request.nextUrl.clone();
  destino.search = "";
  if (codigoError) {
    destino.pathname = "/ingresar";
    destino.searchParams.set("error", codigoError);
  } else {
    destino.pathname = "/agenda";
  }
  const respuesta = NextResponse.redirect(destino);
  // Lleva la cookie de sesión: que ningún CDN la guarde.
  respuesta.headers.set("Cache-Control", "private, no-store");
  return respuesta;
}
