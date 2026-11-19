import type { Metadata } from "next";
import { getUserId } from "@/lib/user";
import { PanelHeader } from "../panel-slots";
import { ServicesList } from "./list";

export const metadata: Metadata = {
  title: "Servicios · Agenditas",
};

// El layout ya redirige si falta sesión o negocio; acá solo se muestra.
export default async function ServicesPage() {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <PanelHeader title="Servicios" subtitle="Lo que ofrecés, cuánto dura y cuánto cuesta." />

      <ServicesList />
    </div>
  );
}
