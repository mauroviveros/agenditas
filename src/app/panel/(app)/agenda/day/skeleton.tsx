import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto del día, con la misma forma que el real para que no salte al cargar: la fecha con su
// bajada y los botones de día, y la caja de la línea de tiempo.
export function DayAgendaSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36 md:h-8" />
      </div>
      <Skeleton className="h-[40rem] w-full rounded-xl" />
    </div>
  );
}
