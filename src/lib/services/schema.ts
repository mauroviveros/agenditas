import { z } from "zod";

// Las mismas reglas que la tabla services y save_service: la pantalla avisa antes de
// llegar a la base, y la base sigue siendo la última palabra. Las claves van en
// snake_case como las de la RPC, salvo `id`: la Server Action lo pasa como `service_id`
// (y suma `business_id`, que sale de la sesión).
export const MAX_SERVICES = 50;
export const NAME_MAX = 60;
export const DURATION_MIN = 5;
export const DURATION_MAX = 480;
export const DURATION_STEP = 5;
// $10.000.000 en centavos.
export const MAX_PRICE_CENTS = 1_000_000_000;

const CENTS_PER_PESO = 100;

// El negocio no está acá: sale de la sesión, y lo que sobre en lo que mande el navegador
// se descarta. `id` solo viene cuando se edita un servicio.
export const serviceSchema = z.object({
  id: z.uuid("No encontramos ese servicio.").optional(),
  name: z
    .string({ error: "Poné un nombre." })
    .trim()
    .min(1, "Poné un nombre.")
    .max(NAME_MAX, `El nombre puede tener hasta ${NAME_MAX} caracteres.`),
  duration_minutes: z
    .number({ error: "Poné cuánto dura." })
    .int("Poné cuánto dura.")
    .min(DURATION_MIN, `Dura al menos ${DURATION_MIN} minutos.`)
    .max(DURATION_MAX, `Dura hasta ${DURATION_MAX} minutos.`)
    .multipleOf(DURATION_STEP, `La duración va de a ${DURATION_STEP} minutos.`),
  price_cents: z
    .number({ error: "Poné el precio." })
    .int("Poné el precio.")
    .min(0, "El precio no puede ser negativo.")
    .max(MAX_PRICE_CENTS, "El precio puede ser de hasta $ 10.000.000."),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// Pesos escritos a mano → centavos. El punto separa miles (opcional) y la coma, los
// centavos (uno o dos dígitos). "1.500,50", "1500,5" y "$ 1500" valen; "1500.50" no, para
// no confundir un punto de miles con uno decimal. null si no se entiende.
const PESOS_PATTERN = /^\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

export function parsePesos(text: string): number | null {
  const match = PESOS_PATTERN.exec(text.trim());
  if (!match) {
    return null;
  }
  const pesos = Number(match[1].replaceAll(".", ""));
  const cents = Number((match[2] ?? "").padEnd(2, "0"));
  const total = pesos * CENTS_PER_PESO + cents;
  return Number.isSafeInteger(total) ? total : null;
}

// Centavos → lo que se escribe en el campo del precio: "1500" o "1500,50", sin puntos de
// miles. parsePesos lo vuelve a leer igual.
export function pesosInputValue(cents: number): string {
  const pesos = Math.floor(cents / CENTS_PER_PESO);
  const rest = cents % CENTS_PER_PESO;
  return rest === 0 ? String(pesos) : `${pesos},${String(rest).padStart(2, "0")}`;
}

const wholePesosFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const centsFormat = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

// Centavos → "$ 1.500" o, con centavos, "$ 1.500,50".
export function formatPesos(cents: number): string {
  const format = cents % CENTS_PER_PESO === 0 ? wholePesosFormat : centsFormat;
  return format.format(cents / CENTS_PER_PESO);
}

// Lo que se lee en la lista: "Sin cargo" para el precio 0 y pesos para el resto.
export function formatPrice(cents: number): string {
  return cents === 0 ? "Sin cargo" : formatPesos(cents);
}

const MINUTES_PER_HOUR = 60;

// Minutos → "45 min", "1 h", "1 h 30". Las horas justas van sin minutos.
export function formatDuration(minutes: number): string {
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}
