import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 4;

// Esqueleto de la lista, con la misma forma que la real para que no salte al cargar: la
// búsqueda, la caja con borde (con encabezado en escritorio), filas de 64 px en celu o de
// 56 px desde md, y el pie.
export function ServicesSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <Skeleton className="h-11 w-full md:h-8 md:max-w-sm" />
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        <div className="hidden h-10 items-center px-6 md:flex">
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex min-h-16 items-center gap-4 px-6 md:min-h-14">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="ml-auto hidden h-5 w-16 md:block" />
            <Skeleton className="ml-auto h-5 w-16 md:ml-0" />
          </div>
        ))}
      </div>
      <Skeleton className="h-5 w-24" />
    </div>
  );
}
