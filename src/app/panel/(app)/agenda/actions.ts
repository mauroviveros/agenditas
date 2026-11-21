"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appointmentSchema, moveSchema } from "@/lib/appointments/schema";
import { DURATION_MAX, DURATION_MIN } from "@/lib/services/schema";
import { getMyBusiness } from "@/lib/business/queries";
import { createClient } from "@/lib/supabase/server";
import { startsAtOf } from "@/lib/time";

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
  ["not_business_owner", "No encontramos ese servicio. Quizás lo archivaste."],
]);
const MOVE_ERRORS = new Map([
  ["overlap", OVERLAP_ERROR],
  ["invalid_appointment", INVALID_ERROR],
  ["not_business_owner", "No encontramos ese turno. Quizás ya lo cancelaste."],
]);

const CANCEL_GENERIC_ERROR = "No pudimos cancelar el turno. Probá de nuevo.";
const RESTORE_GENERIC_ERROR = "No pudimos deshacer la cancelación. Probá de nuevo.";
const APPOINTMENT_NOT_FOUND = "No encontramos ese turno.";
const CANCEL_ERRORS = new Map([
  ["not_business_owner", "No encontramos ese turno. Quizás ya lo cancelaste."],
]);
// Deshacer puede chocar con un turno que entró en ese horario mientras tanto.
const RESTORE_ERRORS = new Map([
  ["overlap", "Ese horario se ocupó mientras tanto, no se puede deshacer."],
  ["not_business_owner", APPOINTMENT_NOT_FOUND],
]);

const appointmentIdSchema = z.uuid(APPOINTMENT_NOT_FOUND);

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
  error: { message: string; code?: string } | null,
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
  // Solo el código y el mensaje: el detalle de Postgres puede traer el nombre y el teléfono del cliente.
  console.error(`${context}: rpc failed`, { code: error?.code, message: error?.message });
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

// Cancela un turno: libera el horario pero queda registrado, así que se puede deshacer.
export async function cancelAppointment(input: unknown): Promise<AppointmentResult> {
  return changeStatus("cancel_appointment", input, CANCEL_ERRORS, CANCEL_GENERIC_ERROR);
}

// Deshace una cancelación: el turno vuelve con el mismo id si su horario sigue libre.
export async function restoreAppointment(input: unknown): Promise<AppointmentResult> {
  return changeStatus("restore_appointment", input, RESTORE_ERRORS, RESTORE_GENERIC_ERROR);
}

async function changeStatus(
  rpcName: "cancel_appointment" | "restore_appointment",
  input: unknown,
  translations: Map<string, string>,
  genericError: string,
): Promise<AppointmentResult> {
  const parsed = appointmentIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: APPOINTMENT_NOT_FOUND };
  }
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, {
    business_id: businessId,
    appointment_id: parsed.data,
  });

  return resultOf(error, translations, genericError, rpcName);
}

export type BlockResult = { ok: true; id: string; startsAt: string } | { ok: false; error: string };

const BLOCK_GENERIC_ERROR = "No pudimos bloquear el horario. Probá de nuevo.";
const BLOCK_ERRORS = new Map([
  ["overlap", "Tenés un turno en ese horario. Movelo o cancelalo primero."],
  ["invalid_appointment", "Revisá la duración del bloqueo."],
]);
// Mismo rango que la RPC y que un servicio.
const blockMinutesSchema = z.number().int().min(DURATION_MIN).max(DURATION_MAX);

// «Salgo N min»: bloquea el horario desde ahora, sin mover turnos. Devuelve el id del bloqueo
// para poder deshacerlo cancelándolo.
export async function blockTime(input: unknown): Promise<BlockResult> {
  const parsed = blockMinutesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: BLOCK_GENERIC_ERROR };
  }
  const businessId = await getBusinessId();

  // La hora de inicio la fija el servidor, y esa misma vuelve para mostrarla.
  const startsAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("block_time", {
    business_id: businessId,
    starts_at: startsAt,
    minutes: parsed.data,
  });

  const result = resultOf(error, BLOCK_ERRORS, BLOCK_GENERIC_ERROR, "block time");
  return result.ok ? { ok: true, id: data as string, startsAt } : result;
}
