import { z } from "zod";

// Las mismas reglas que los checks de public.businesses: el formulario avisa
// antes de llegar a la base, y la base sigue siendo la última palabra.
const NAME_MIN = 2;
const NAME_MAX = 60;
const SLUG_MIN = 3;
export const SLUG_MAX = 40;
// Lugar que se le deja a lo que el solista suma al link (la zona), con su guion.
export const SLUG_SUFFIX_ROOM = 12;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, `Poné un nombre de al menos ${NAME_MIN} letras.`)
    .max(NAME_MAX, `El nombre puede tener hasta ${NAME_MAX} caracteres.`),
  slug: z
    .string()
    .trim()
    .min(SLUG_MIN, `El link necesita al menos ${SLUG_MIN} caracteres.`)
    .max(SLUG_MAX, `El link puede tener hasta ${SLUG_MAX} caracteres.`)
    .regex(
      SLUG_PATTERN,
      "Usá solo minúsculas, números y guiones, sin guiones al principio ni al final.",
    ),
});

// Sugiere el link a partir del nombre: "Barbería Tito" → "barberia-tito".
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

// Base del link cuando se le va a sumar algo al final: se recorta para que, con un
// agregado de hasta SLUG_SUFFIX_ROOM letras, el link siga entrando en SLUG_MAX.
export function slugBaseForSuffix(base: string): string {
  return base.slice(0, SLUG_MAX - SLUG_SUFFIX_ROOM - 1).replace(/-+$/, "");
}

// Ruta pública de un negocio, sin dominio (el dominio depende del entorno).
// La página llega en R5.
export const PUBLIC_LINK_PATH = "/reservar/";
