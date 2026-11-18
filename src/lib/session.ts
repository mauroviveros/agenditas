import { cache } from "react";
import { type HolidayRow } from "@/lib/holidays";
import { fechaEnBuenosAires } from "@/lib/hora";
import { type HourRange, toHourRange } from "@/lib/hours";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

const text = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

// Quién está entrando. Lee cookies: usar siempre dentro de <Suspense>.
// cache: layout y página lo piden en el mismo render y no repiten la validación.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) {
    return null;
  }
  const email = claims.email ?? "";
  return {
    id: claims.sub,
    email,
    name: text(claims.user_metadata?.full_name) ?? text(claims.user_metadata?.name) ?? email,
    avatarUrl: text(claims.user_metadata?.avatar_url),
  };
});

export async function getUserId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}

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

// Sus franjas de atención, de lunes a domingo. La RLS deja ver solo las propias.
export async function getMyHours(): Promise<HourRange[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("weekday, start_time, end_time")
    .order("weekday")
    .order("start_time");
  if (error) {
    throw new Error(`No pudimos leer los horarios: ${error.message}`);
  }
  return data.map(toHourRange);
}

const UPCOMING_HOLIDAYS = 5;

// Los próximos feriados desde hoy (en Buenos Aires, hoy incluido). Lectura pública por RLS.
export async function getUpcomingHolidays(): Promise<HolidayRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("holidays")
    .select("date, name, kind")
    .gte("date", fechaEnBuenosAires(new Date()))
    .order("date")
    .limit(UPCOMING_HOLIDAYS);
  if (error) {
    throw new Error(`No pudimos leer los feriados: ${error.message}`);
  }
  return data as HolidayRow[];
}
