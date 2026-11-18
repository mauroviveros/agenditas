import { headers } from "next/headers";

// shortcut: el dominio sale del header Host (solo se muestra, no redirige a nada);
// si hay un proxy que lo cambia, leer x-forwarded-host primero.
const FALLBACK_HOST = "agenditas.app";

// Dominio donde se abrió la app (localhost, preview o producción), para armar el
// link de reservas desde el servidor y que llegue ya correcto en el primer HTML.
export async function getPublicHost(): Promise<string> {
  return (await headers()).get("host") ?? FALLBACK_HOST;
}
