import { ServicesSkeleton } from "./list/skeleton";

// Esqueleto de Servicios: la lista (el título lo pone el encabezado del panel).
export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <ServicesSkeleton />
    </div>
  );
}
