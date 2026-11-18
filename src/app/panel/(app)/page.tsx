import type { Metadata } from "next";
import { getMyBusiness, getUserId } from "@/lib/session";

export const metadata: Metadata = {
  title: "Panel · Agenditas",
};

// El layout ya redirige si falta sesión o negocio; acá solo se muestra.
// Mientras carga, Next muestra loading.tsx.
export default async function PanelPage() {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }
  const business = await getMyBusiness();
  if (!business) {
    return null;
  }
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
        {business.name}
      </h1>

      <section className="rounded-xl border border-dashed border-border p-6">
        <h2 className="text-base font-semibold">Tu agenda aparece acá</h2>
        <p className="mt-1 text-muted-foreground">
          Cuando cargues tus horarios y tus servicios, vas a ver los turnos del día en este lugar.
        </p>
      </section>
    </div>
  );
}
