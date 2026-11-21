import { Suspense } from "react";
import { getMyArchivedServices, getMyServices } from "@/lib/services/queries";
import { ServicesSkeleton } from "./skeleton";
import { ServicesView } from "./view";

// Los servicios con su esqueleto mientras cargan.
export function ServicesList() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesLoader />
    </Suspense>
  );
}

// Lee los servicios y se los pasa a la vista (que decide entre la lista y el vacío). Sin
// try/catch a propósito: si la lectura falla, el error sube a (app)/error.tsx. Mostrar el vacío
// invitaría a cargar el primero sobre servicios que sí existen.
export async function ServicesLoader() {
  const [services, archived] = await Promise.all([getMyServices(), getMyArchivedServices()]);
  return <ServicesView services={services} archived={archived} />;
}
