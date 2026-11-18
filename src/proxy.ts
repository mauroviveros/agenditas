import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const LOGIN_PATH = "/login";
const PANEL_PATH = "/panel";

const isPanelPath = (pathname: string): boolean =>
  pathname === PANEL_PATH || pathname.startsWith(`${PANEL_PATH}/`);

// Refresca la sesión de Supabase en cada pedido y deja las cookies nuevas en la
// respuesta. Además hace el chequeo optimista de sesión: sin sesión el panel manda a
// /login, y con sesión /login manda al panel. Solo lee la cookie, sin consultar la base.
// No es la única barrera: el layout del panel vuelve a chequear la sesión y la RLS
// decide qué filas se ven. Lo que necesita la base (si tiene negocio) va en las páginas.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [header, value] of Object.entries(headers)) {
          response.headers.set(header, value);
        }
      },
    },
  });

  // getClaims valida el token y lo refresca si venció.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!signedIn && isPanelPath(pathname)) {
    return redirectTo(LOGIN_PATH, request, response);
  }
  if (signedIn && pathname === LOGIN_PATH) {
    return redirectTo(PANEL_PATH, request, response);
  }

  return response;
}

// Redirección (307) que conserva las cookies que Supabase pudo haber renovado.
function redirectTo(path: string, request: NextRequest, refreshed: NextResponse): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";

  const redirect = NextResponse.redirect(url);
  for (const cookie of refreshed.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  // Lleva cookies de sesión: ningún caché compartido debe guardarla.
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  // Todo menos los archivos estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
