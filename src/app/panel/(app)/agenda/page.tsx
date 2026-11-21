import type { Metadata } from "next";
import { resolveDay } from "@/lib/appointments/day";
import { dateInBuenosAires } from "@/lib/time";
import { getUserId } from "@/lib/user";
import { DayAgenda } from "./day";

export const metadata: Metadata = {
  title: "Agenda · Agenditas",
};

// El layout ya redirige si falta sesión o negocio; acá solo se muestra. El día sale de la URL
// (?dia=AAAA-MM-DD) y, si falta o no es una fecha, es hoy. Mientras carga, Next muestra loading.tsx.
export default async function AgendaPage({ searchParams }: PageProps<"/panel/agenda">) {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }

  const today = dateInBuenosAires(new Date());
  const day = resolveDay((await searchParams).dia, today);

  return <DayAgenda day={day} today={today} />;
}
