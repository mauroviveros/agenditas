// Códigos de error de Supabase Auth → mensaje en voseo para la pantalla de ingresar.
const mensajes: Record<string, string> = {
  email_invalido: "Revisá el email, parece que tiene un error.",
  email_address_invalid: "Revisá el email, parece que tiene un error.",
  validation_failed: "Revisá el email, parece que tiene un error.",
  over_email_send_rate_limit:
    "Ya te mandamos un link. Esperá un minuto antes de pedir otro.",
  over_request_rate_limit: "Hubo muchos intentos. Probá de nuevo en un rato.",
  otp_expired: "El link venció o ya se usó. Pedí uno nuevo.",
  flow_state_expired: "El ingreso tardó demasiado. Probá de nuevo.",
  flow_state_not_found: "El ingreso tardó demasiado. Probá de nuevo.",
  bad_code_verifier:
    "Abrí el link en el mismo navegador donde lo pediste, o pedí uno nuevo.",
  access_denied: "Cancelaste el ingreso con Google.",
  google_apagado:
    "Ingresar con Google todavía no está disponible. Usá tu email.",
  signup_disabled: "Por ahora no se pueden crear cuentas nuevas.",
};

export function mensajeDeError(codigo: string | undefined | null): string {
  if (codigo && Object.hasOwn(mensajes, codigo)) {
    return mensajes[codigo] as string;
  }
  return "Algo salió mal. Probá de nuevo en un rato.";
}
