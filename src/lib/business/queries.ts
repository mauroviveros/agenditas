import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Su negocio. La RLS deja ver solo el propio, así que no hace falta filtrar por dueño.
export interface MyBusiness {
  id: string;
  name: string;
  slug: string;
}

// cache: el layout y la página del panel lo piden en el mismo render.
export const getMyBusiness = cache(async (): Promise<MyBusiness | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug")
    .maybeSingle();
  if (error) {
    throw new Error(`No pudimos leer el negocio: ${error.message}`);
  }
  return data;
});
