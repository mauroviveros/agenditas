"use server";

import { redirect } from "next/navigation";
import { hoursSchema } from "@/lib/hours";
import { getMyBusiness } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type SaveHoursResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos guardar tus horarios. Probá de nuevo.";

// Errores de la RPC set_business_hours que se le explican al solista.
const RPC_ERRORS: Record<string, string> = {
  overlap: "Hay dos franjas del mismo día que se pisan.",
  invalid_range: "Revisá las franjas: el fin tiene que ser después del inicio.",
};

// Guarda la semana entera: reemplaza lo que había. El negocio sale de la sesión, no de
// lo que mande el navegador. Al terminar, Next vuelve a leer la página que la llamó.
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

  return { ok: true };
}
