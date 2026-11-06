import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// shortcut: lista de rutas del panel a mano, cambiarla por el host `panel.` en la rebanada 14.
const PANEL = ["/agenda"];

// Refresca la sesión y hace el chequeo optimista del panel.
// La autorización real va en el servidor (getUsuario) y en la RLS.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Que ningún CDN cachee una respuesta con la sesión de otro.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Nada entre crear el cliente y getClaims(): el refresco tiene que pasar acá.
  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;

  if (
    !data?.claims &&
    PANEL.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    return redirigir(request, response, "/ingresar");
  }
  if (data?.claims && pathname === "/ingresar") {
    return redirigir(request, response, "/agenda");
  }
  return response;
}

// La redirección tiene que llevar las cookies y headers que dejó setAll, o se pierde la sesión.
function redirigir(request: NextRequest, response: NextResponse, ruta: string) {
  const redireccion = NextResponse.redirect(new URL(ruta, request.url));
  for (const cookie of response.cookies.getAll()) {
    redireccion.cookies.set(cookie);
  }
  for (const header of ["cache-control", "expires", "pragma"]) {
    const valor = response.headers.get(header);
    if (valor) redireccion.headers.set(header, valor);
  }
  return redireccion;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
