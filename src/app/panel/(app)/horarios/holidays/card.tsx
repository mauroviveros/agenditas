import type { ReactNode } from "react";
import { SectionCard } from "@/components/section-card";

// El marco de la card: el título está en todos los estados; adentro va lo que toque.
export function HolidaysCard({ children }: { children: ReactNode }) {
  return (
    <SectionCard
      id="holidays-title"
      title="Próximos feriados"
      description="Para que no te agarren de sorpresa."
    >
      {children}
    </SectionCard>
  );
}
