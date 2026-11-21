import { createClient } from "@/lib/supabase/server";

// Cuántos turnos tiene cada servicio. Un Map y no un objeto con `counts[id]++`: así un id como
// "constructor" no encuentra nada por herencia.
export function countByService(rows: { service_id: string | null }[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const { service_id } of rows) {
    if (service_id) {
      counts.set(service_id, (counts.get(service_id) ?? 0) + 1);
    }
  }
  return Object.fromEntries(counts);
}

// Los turnos confirmados que todavía no empezaron, por servicio: lo que se ve antes de archivar uno.
// shortcut: lee las filas y las cuenta acá; con miles de turnos por delante (PostgREST corta en
// 1000) pasar a una RPC que agrupe en la base.
export async function getUpcomingCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("service_id")
    .eq("kind", "appointment")
    .eq("status", "confirmed")
    .gte("starts_at", new Date().toISOString());
  if (error) {
    throw new Error(`No pudimos leer los turnos por delante: ${error.message}`);
  }
  return countByService(data);
}
