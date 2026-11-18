"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { businessSchema } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

export interface CreateBusinessState {
  fieldErrors?: { name?: string; slug?: string };
  formError?: string;
}

// Errores de la RPC create_business que se muestran en un campo.
const RPC_FIELD_ERRORS: Record<string, CreateBusinessState["fieldErrors"]> = {
  slug_taken: { slug: "Ese link ya lo usa otro negocio. Probá con otro." },
  invalid_slug: { slug: "Usá solo minúsculas, números y guiones." },
  invalid_name: { name: "Revisá el nombre: entre 2 y 60 caracteres." },
};

// ¿Está libre el link? El formulario la llama mientras el solista escribe.
// null = no se pudo saber: el formulario no afirma nada y create_business decide.
export async function checkSlugAvailability(slug: string): Promise<boolean | null> {
  if (!businessSchema.shape.slug.safeParse(slug).success) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_slug_available", { slug });
  if (error) {
    console.error("check slug: rpc failed", error);
    return null;
  }
  return data === true;
}

export async function createBusiness(
  _previous: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  const parsed = businessSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
  });
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors: { name: fieldErrors.name?.[0], slug: fieldErrors.slug?.[0] } };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_business", parsed.data);

  if (error?.message === "not_authenticated") {
    redirect("/login");
  }
  if (error?.message === "business_already_exists") {
    redirect("/panel");
  }
  if (error) {
    const fieldErrors = RPC_FIELD_ERRORS[error.message];
    if (fieldErrors) {
      return { fieldErrors };
    }
    console.error("create business: rpc failed", error);
    return { formError: "No pudimos crear tu negocio. Probá de nuevo." };
  }

  redirect("/panel");
}
