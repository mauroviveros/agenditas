"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { startsAtOf } from "@/lib/appointments/day";
import { appointmentSchema, moveSchema } from "@/lib/appointments/schema";
import { getMyBusiness } from "@/lib/business/queries";
import { createClient } from "@/lib/supabase/server";

export type AppointmentResult = { ok: true } | { ok: false; error: string };

const SAVE_GENERIC_ERROR = "No pudimos guardar el turno. Probá de nuevo.";
const MOVE_GENERIC_ERROR = "No pudimos mover el turno. Probá de nuevo.";
const OVERLAP_ERROR = "Ese horario se acaba de ocupar. Elegí otro.";
const INVALID_ERROR = "Revisá los datos del turno.";

// Errores de las RPC de turnos que se le explican al solista. Un Map y no un objeto: así un
// mensaje como "constructor" no encuentra nada por herencia.
const CREATE_ERRORS = new Map([
  ["overlap", OVERLAP_ERROR],
  ["invalid_appointment", INVALID_ERROR],
  ["not_business_owner", "No encontramos ese servicio. Quizás lo borraste."],
]);
const MOVE_ERRORS = new Map([
  ["overlap", OVERLAP_ERROR],
  ["invalid_appointment", INVALID_ERROR],
  ["not_business_owner", "No encontramos ese turno. Quizás ya lo cancelaste."],
]);

// El negocio sale de la sesión, no de lo que mande el navegador.
async function getBusinessId(): Promise<string> {
  const business = await getMyBusiness();
  if (!business) {
    redirect("/panel");
  }
  return business.id;
}

// Corta con el login si la RPC dice que no hay sesión; si no, devuelve el aviso que corresponde.
function resultOf(
  error: { message: string } | null,
  translations: Map<string, string>,
  genericError: string,
  context: string,
): AppointmentResult {
  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (!error) {
    // Sin esto la pantalla sigue con lo anterior: una Server Action no vuelve a leer sola.
    revalidatePath("/panel/agenda");
    return { ok: true };
  }
  const message = translations.get(error.message);
  if (message) {
    return { ok: false, error: message };
  }
  console.error(`${context}: rpc failed`, error);
  return { ok: false, error: genericError };
}

// Agenda un turno: el día y la hora son de Buenos Aires y se pasan a UTC acá. Lo que no se entiende
// no llega a la base.
export async function createAppointment(input: unknown): Promise<AppointmentResult> {
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? SAVE_GENERIC_ERROR };
  }
  const { service_id, client_name, client_phone, day, time } = parsed.data;
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_appointment", {
    business_id: businessId,
    service_id,
    client_name,
    // shortcut: los tipos generados piden un string, pero la RPC acepta null para «sin teléfono»;
    // si save/create pasan a aceptar null en el tipo, sacar el cast.
    client_phone: client_phone as unknown as string,
    starts_at: startsAtOf(day, time),
  });

  return resultOf(error, CREATE_ERRORS, SAVE_GENERIC_ERROR, "create appointment");
}

// Mueve un turno a otro día u hora, con la misma duración.
export async function moveAppointment(input: unknown): Promise<AppointmentResult> {
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? MOVE_GENERIC_ERROR };
  }
  const { id, day, time } = parsed.data;
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc("move_appointment", {
    business_id: businessId,
    appointment_id: id,
    starts_at: startsAtOf(day, time),
  });

  return resultOf(error, MOVE_ERRORS, MOVE_GENERIC_ERROR, "move appointment");
}
