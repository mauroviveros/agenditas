import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { getMyBusiness, getUserId } from "@/lib/session";
import { BusinessForm } from "./business-form";

export const metadata: Metadata = {
  title: "Tu negocio · Agenditas",
};

// Escritorio: formulario a la izquierda y vista previa de la página a la derecha.
// Celu: una columna, con el botón abajo al alcance del pulgar.
export default function NewBusinessPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:max-w-5xl md:px-10 md:py-10">
      <p className="font-heading text-lg font-semibold tracking-tight">Agenditas</p>

      <Suspense fallback={null}>
        <Guard />
      </Suspense>

      <BusinessForm
        heading={
          <div className="mt-10 mb-8 md:mt-0">
            <PageTitle>Armá tu negocio</PageTitle>
            <p className="mt-2 text-muted-foreground">
              Con esto armamos tu página para que tus clientes reserven solos.
            </p>
          </div>
        }
      />
    </main>
  );
}

// Guardas: sin sesión va a /login; si ya tiene negocio, al panel.
async function Guard() {
  if (!(await getUserId())) {
    redirect("/login");
  }
  if (await getMyBusiness()) {
    redirect("/panel");
  }
  return null;
}
