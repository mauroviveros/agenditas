import type { Metadata } from "next";
import { getUserId } from "@/lib/user";
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

  return <ServicesList />;
}
