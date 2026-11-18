import type { Metadata } from "next";
import { getMyHours, getUserId } from "@/lib/session";
import { HoursForm } from "./hours-form";

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
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-balance md:text-[2.5rem] md:leading-[1.05]">
          Horarios
        </h1>
        <p className="text-muted-foreground">
          Prendé los días en que atendés y poné las horas. Si cortás para almorzar, tocá «+
          Almuerzo».
        </p>
      </div>

      <HoursForm initial={hours} />
    </div>
  );
}
