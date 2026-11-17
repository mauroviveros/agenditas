import type { Metadata } from "next";
import { BusinessForm } from "./business-form";

export const metadata: Metadata = {
  title: "Tu negocio · Agenditas",
};

// Escritorio: formulario a la izquierda y vista previa de la página a la derecha.
// Celu: una columna, con el botón abajo al alcance del pulgar.
export default function NewBusinessPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:max-w-5xl md:px-10 md:py-10">
      <p className="font-heading text-xl font-extrabold tracking-[-0.02em]">Agenditas</p>

      <BusinessForm
        heading={
          <div className="mt-10 mb-8 md:mt-0">
            <h1 className="font-heading text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-balance md:text-[2.5rem] md:leading-[1.05]">
              Armá tu negocio
            </h1>
            <p className="mt-2 text-muted-foreground">
              Con esto armamos tu página para que tus clientes reserven solos.
            </p>
          </div>
        }
      />
    </main>
  );
}
