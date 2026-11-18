import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 5;

// Esqueleto de la card de feriados: el título y una fila por feriado.
export function HolidaysCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-7 w-1/3" />
      {Array.from({ length: ROWS }, (_, row) => (
        <Skeleton key={row} className="h-10 rounded-xl" />
      ))}
    </div>
  );
}
