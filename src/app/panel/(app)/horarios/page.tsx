import type { Metadata } from "next";
import { weekdayIndex } from "@/lib/hora";
import { getMyHours, getUserId } from "@/lib/session";
import { PanelHeader } from "../slots";
import { HoursForm } from "./form";

export const metadata: Metadata = {
  title: "Horarios · Agenditas",
};

// El layout ya redirige si falta sesión o negocio; acá solo se muestra.
// Mientras carga, Next muestra loading.tsx.
export default async function HoursPage() {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }
  const hours = await getMyHours();

  return (
    <div className="flex w-full flex-col gap-8">
      <PanelHeader>
        <h1 className="truncate font-heading text-base font-medium">Horarios</h1>
      </PanelHeader>

      <p className="text-muted-foreground">
        Prendé los días en que atendés y poné las horas. Si cortás para almorzar, tocá «+
        Almuerzo».
      </p>

      <HoursForm initial={hours} today={weekdayIndex(new Date())} />
    </div>
  );
}
