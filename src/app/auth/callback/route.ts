import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google vuelve acá con un `code`; se canjea por la sesión y se va al panel.
// El destino es fijo a propósito: un `next` de la URL abriría un redirect abierto.
export async function GET(request: Request): Promise<NextResponse> {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/panel`);
    }
    console.error("auth callback: code exchange failed", error);
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
