import type { Session } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth";
import { type Business, businessQuery } from "./business";

// Entrar al panel pide sesión y negocio; sin sesión va al ingreso y sin negocio al alta.
export async function requireBusiness(
  queryClient: QueryClient,
): Promise<{ session: Session; business: Business }> {
  const session = await getSession();
  if (!session) throw redirect({ to: "/ingresar" });
  const business = await queryClient.ensureQueryData(businessQuery);
  if (!business) throw redirect({ to: "/crear-negocio" });
  return { session, business };
}

export async function requireSessionWithoutBusiness(
  queryClient: QueryClient,
): Promise<Session> {
  const session = await getSession();
  if (!session) throw redirect({ to: "/ingresar" });
  const business = await queryClient.ensureQueryData(businessQuery);
  if (business) throw redirect({ to: "/" });
  return session;
}

export async function redirectIfSignedIn(): Promise<void> {
  if (await getSession()) throw redirect({ to: "/" });
}
