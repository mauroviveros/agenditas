import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 4;

// Esqueleto de la lista: filas de la altura de las reales.
export function ServicesSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
