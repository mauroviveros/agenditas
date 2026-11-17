export const DEFAULT_ERROR = "No pudimos guardarlo. Probá de nuevo en un rato.";

// Las claves las lanza `create_business` en la base (ver la migración de businesses).
const MESSAGES: Record<string, string> = {
  not_authenticated: "Tu sesión se venció. Entrá de nuevo.",
  name_invalid: "Poné el nombre de tu negocio, hasta 80 letras.",
  category_invalid: "Elegí un rubro.",
  slug_invalid: "Ese link no vale. Usá de 3 a 40 letras, números o guiones.",
  slug_taken: "Ese link ya está tomado. Probá con otro.",
  business_already_exists: "Ya tenés un negocio. Te llevamos a tu agenda.",
};

export function businessErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return MESSAGES[error.message] ?? DEFAULT_ERROR;
  }
  return DEFAULT_ERROR;
}

const RATE_LIMIT_MESSAGE =
  "Pediste muchos links seguidos. Esperá un minuto y probá de nuevo.";
const SEND_ERROR =
  "No pudimos mandar el link. Revisá el mail y probá de nuevo.";

// Errores de Auth al pedir el link: el límite de envíos tiene su propio texto.
export function signInErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "over_email_send_rate_limit"
  ) {
    return RATE_LIMIT_MESSAGE;
  }
  return SEND_ERROR;
}
