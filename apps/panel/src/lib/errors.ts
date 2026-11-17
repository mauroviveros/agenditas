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

function errorField(error: unknown, field: "code" | "message"): string {
  if (typeof error === "object" && error !== null && field in error) {
    const value = (error as Record<string, unknown>)[field];
    if (typeof value === "string") return value;
  }
  return "";
}

// Códigos de Postgres: 23505 = valor repetido, 23514 = no cumple una regla (CHECK).
export function serviceErrorMessage(error: unknown): string {
  const code = errorField(error, "code");
  if (code === "23505") return "Ya tenés un servicio con ese nombre.";
  if (code === "23514")
    return "Revisá el nombre, la duración y el precio e intentá de nuevo.";
  return DEFAULT_ERROR;
}

export function scheduleErrorMessage(error: unknown): string {
  const code = errorField(error, "code");
  if (errorField(error, "message") === "date_in_past")
    return "Esa fecha ya pasó. Elegí una desde hoy.";
  if (errorField(error, "message") === "no_business")
    return "Tu sesión se venció. Entrá de nuevo.";
  if (code === "23505") return "Ese día ya está cargado.";
  if (code === "23514")
    return "Revisá los horarios: tienen que ir de a 15 minutos y el cierre después de la apertura.";
  return DEFAULT_ERROR;
}
