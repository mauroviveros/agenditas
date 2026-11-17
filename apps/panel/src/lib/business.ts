import { queryOptions } from "@tanstack/react-query";
import { getSupabase } from "./supabase";

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export interface NewBusiness {
  name: string;
  category: string;
  slug: string;
}

// La RLS deja ver solo el negocio propio, y hay uno por usuario (MVP solista).
export const businessQuery = queryOptions({
  queryKey: ["business"],
  queryFn: async (): Promise<Business | null> => {
    const { data, error } = await getSupabase()
      .from("businesses")
      .select("id, name, slug, category")
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export async function createBusiness(input: NewBusiness): Promise<string> {
  const { data, error } = await getSupabase().rpc("create_business", {
    p_name: input.name,
    p_category: input.category,
    p_slug: input.slug,
  });
  if (error) throw error;
  return data;
}

export async function slugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc("slug_available", {
    p_slug: slug,
  });
  if (error) throw error;
  return data === true;
}
