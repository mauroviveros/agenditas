import type { Tables } from "@/lib/supabase/database.types";

// Lo que se lee de appointments para armar la agenda del día.
export type AppointmentRow = Pick<
  Tables<"appointments">,
  | "id"
  | "kind"
  | "service_name"
  | "service_price_cents"
  | "client_name"
  | "client_phone"
  | "starts_at"
  | "ends_at"
>;

interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
}

// Un turno (con su servicio y su cliente) o un bloqueo («salgo 30 min»), que solo ocupa horario.
export type AgendaItem =
  | (Slot & {
      kind: "appointment";
      serviceName: string;
      priceCents: number;
      clientName: string;
      clientPhone: string | null;
    })
  | (Slot & { kind: "block" });

// La base garantiza que un turno trae servicio y cliente (appointments_kind_check). Si falta
// alguno es un dato roto: se corta en vez de mostrar un turno a medias.
function toAgendaItem(row: AppointmentRow): AgendaItem {
  const slot = { id: row.id, startsAt: row.starts_at, endsAt: row.ends_at };
  if (row.kind === "block") {
    return { kind: "block", ...slot };
  }
  if (row.service_name === null || row.service_price_cents === null || row.client_name === null) {
    throw new Error(`El turno ${row.id} no tiene servicio o cliente`);
  }
  return {
    kind: "appointment",
    ...slot,
    serviceName: row.service_name,
    priceCents: row.service_price_cents,
    clientName: row.client_name,
    clientPhone: row.client_phone,
  };
}

export function parseAgenda(rows: AppointmentRow[]): AgendaItem[] {
  return rows.map(toAgendaItem);
}
