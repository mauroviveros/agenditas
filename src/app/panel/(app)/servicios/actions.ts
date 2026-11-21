"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getMyBusiness } from "@/lib/business/queries";
import { serviceSchema } from "@/lib/services/schema";
import { createClient } from "@/lib/supabase/server";

export type ServiceResult = { ok: true } | { ok: false; error: string };

const SAVE_GENERIC_ERROR = "No pudimos guardar el servicio. Probá de nuevo.";
const DELETE_GENERIC_ERROR = "No pudimos borrar el servicio. Probá de nuevo.";
const RESTORE_GENERIC_ERROR = "No pudimos deshacer el borrado. Probá de nuevo.";
const NOT_FOUND_ERROR = "No encontramos ese servicio.";

// Errores de las RPC save_service y delete_service que se le explican al solista. Un
// Map y no un objeto: así un mensaje como "constructor" no encuentra nada por herencia.
const SAVE_ERRORS = new Map([
  ["duplicate_name", "Ya tenés un servicio con ese nombre."],
  ["service_limit", "Llegaste al máximo de 50 servicios."],
  ["invalid_service", "Revisá los datos del servicio."],
  ["not_business_owner", NOT_FOUND_ERROR],
]);
const DELETE_ERRORS = new Map([
  ["not_business_owner", "No encontramos ese servicio. Quizás ya lo borraste."],
]);

// Deshacer vuelve a mostrar el servicio archivado: puede chocar con uno nuevo del mismo nombre
// o con el tope, y eso se le dice.
const RESTORE_ERRORS = new Map([
  ["duplicate_name", "Ya tenés un servicio con ese nombre."],
  ["service_limit", "Llegaste al máximo de 50 servicios."],
  ["not_business_owner", NOT_FOUND_ERROR],
]);

const serviceIdSchema = z.uuid(NOT_FOUND_ERROR);

// El negocio sale de la sesión, no de lo que mande el navegador.
async function getBusinessId(): Promise<string> {
  const business = await getMyBusiness();
  if (!business) {
    redirect("/panel");
  }
  return business.id;
}

// Crea un servicio o, si trae `id`, lo edita. Lo que no se entiende no llega a la base.
export async function saveService(input: unknown): Promise<ServiceResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? SAVE_GENERIC_ERROR };
  }
  const { id, name, duration_minutes, price_cents } = parsed.data;
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_service", {
    business_id: businessId,
    // shortcut: los tipos generados piden un uuid acá, pero para crear la RPC necesita
    // null explícito; si save_service pasa service_id al final con default null, sacar el cast.
    service_id: (id ?? null) as unknown as string,
    name,
    duration_minutes,
    price_cents,
  });

  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (error) {
    const message = SAVE_ERRORS.get(error.message);
    if (message) {
      return { ok: false, error: message };
    }
    console.error("save service: rpc failed", error);
    return { ok: false, error: SAVE_GENERIC_ERROR };
  }

  // Sin esto la pantalla sigue con lo anterior: una Server Action no vuelve a leer sola.
  revalidatePath("/panel/servicios");
  return { ok: true };
}

export async function deleteService(input: unknown): Promise<ServiceResult> {
  const parsed = serviceIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_service", {
    business_id: businessId,
    service_id: parsed.data,
  });

  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (error) {
    const message = DELETE_ERRORS.get(error.message);
    if (message) {
      return { ok: false, error: message };
    }
    console.error("delete service: rpc failed", error);
    return { ok: false, error: DELETE_GENERIC_ERROR };
  }

  revalidatePath("/panel/servicios");
  return { ok: true };
}

// Deshace un borrado: desarchiva el servicio (vuelve con el mismo id y en su lugar de la lista).
export async function restoreService(input: unknown): Promise<ServiceResult> {
  const parsed = serviceIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: NOT_FOUND_ERROR };
  }
  const businessId = await getBusinessId();

  const supabase = await createClient();
  const { error } = await supabase.rpc("restore_service", {
    business_id: businessId,
    service_id: parsed.data,
  });

  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (error) {
    const message = RESTORE_ERRORS.get(error.message);
    if (message) {
      return { ok: false, error: message };
    }
    console.error("restore service: rpc failed", error);
    return { ok: false, error: RESTORE_GENERIC_ERROR };
  }

  revalidatePath("/panel/servicios");
  return { ok: true };
}
