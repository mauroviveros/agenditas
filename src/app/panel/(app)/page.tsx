import type { Metadata } from "next";
import { Suspense } from "react";
import { PUBLIC_LINK_PREFIX } from "@/lib/business";
import { getMyBusiness, getUserId } from "@/lib/session";
import { CopyLinkButton } from "./copy-link-button";

export const metadata: Metadata = {
  title: "Panel · Agenditas",
};

export default function PanelPage() {
  return (
    <Suspense fallback={null}>
      <Welcome />
    </Suspense>
  );
}

// El layout ya redirige si falta sesión o negocio; acá solo se muestra.
async function Welcome() {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }
  const business = await getMyBusiness();
  if (!business) {
    return null;
  }
  const link = `${PUBLIC_LINK_PREFIX}${business.slug}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <h1 className="font-heading text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-balance md:text-[2.5rem] md:leading-[1.05]">
        {business.name}
      </h1>

      <section className="flex flex-col gap-3 rounded-panel bg-card p-5 md:p-6">
        <h2 className="text-lg font-bold">Tu link para reservas</h2>
        <p className="rounded-full bg-background px-4 py-2 text-sm font-semibold break-all">{link}</p>
        <CopyLinkButton link={`https://${link}`} />
      </section>

      <section className="rounded-panel border-2 border-dashed border-border p-6">
        <h2 className="text-lg font-bold">Tu agenda aparece acá</h2>
        <p className="mt-1 text-muted-foreground">
          Cuando cargues tus horarios y tus servicios, vas a ver los turnos del día en este lugar.
        </p>
      </section>
    </div>
  );
}
