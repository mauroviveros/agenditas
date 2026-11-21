import type { Metadata } from "next";
import { getUserId } from "@/lib/user";
import { PanelPage } from "../panel-page";
import { UpcomingHolidays } from "./holidays";
import { BusinessHours } from "./hours";

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

  return (
    <PanelPage title="Horarios">
      <div className="flex w-full flex-col gap-8">
        <p className="text-muted-foreground">
          Prendé los días en que atendés y poné las horas. Si cortás para almorzar, tocá «+
          Almuerzo».
        </p>

        <BusinessHours />

        <UpcomingHolidays />
      </div>
    </PanelPage>
  );
}
