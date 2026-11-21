import { createClient } from "@/lib/supabase/server";
import { dayBounds } from "@/lib/time";
import { type AgendaItem, parseAgenda } from "./parse";

// La agenda de un día ("AAAA-MM-DD" en hora de Buenos Aires): turnos y bloqueos confirmados,
// por hora. Entra todo lo que toca el día, aunque empiece antes o termine después. La RLS deja
// ver solo lo propio.
export async function getDayAgenda(day: string): Promise<AgendaItem[]> {
  const { from, to } = dayBounds(day);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, kind, service_name, service_price_cents, client_name, client_phone, starts_at, ends_at")
    .eq("status", "confirmed")
    .lt("starts_at", to)
    .gt("ends_at", from)
    .order("starts_at")
    .order("id");
  if (error) {
    throw new Error(`No pudimos leer la agenda: ${error.message}`);
  }
  return parseAgenda(data);
}
