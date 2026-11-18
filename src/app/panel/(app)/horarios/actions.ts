"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hoursSchema } from "@/lib/hours/schema";
import { getMyBusiness } from "@/lib/business/queries";
import { createClient } from "@/lib/supabase/server";

export type SaveHoursResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos guardar tus horarios. Probá de nuevo.";

// Errores de la RPC set_business_hours que se le explican al solista.
const RPC_ERRORS: Record<string, string> = {
  overlap: "Hay dos franjas del mismo día que se pisan.",
  invalid_range: "Revisá las franjas: el fin tiene que ser después del inicio.",
};

// Guarda la semana entera: reemplaza lo que había. El negocio sale de la sesión, no de
// lo que mande el navegador.
export async function saveHours(input: unknown): Promise<SaveHoursResult> {
  const parsed = hoursSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const business = await getMyBusiness();
  if (!business) {
    redirect("/panel");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_business_hours", {
    business_id: business.id,
    ranges: parsed.data,
  });

  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (error) {
    const message = RPC_ERRORS[error.message];
    if (message) {
      return { ok: false, error: message };
    }
    console.error("save hours: rpc failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Sin esto la pantalla sigue con lo anterior: una Server Action no vuelve a leer sola.
  revalidatePath("/panel/horarios");
  return { ok: true };
}
