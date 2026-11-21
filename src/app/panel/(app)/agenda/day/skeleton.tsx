import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 4;

// Esqueleto del día: el título y unas filas de turno.
export function DayAgendaSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: ROWS }, (_, row) => (
        <Skeleton key={row} className="h-14 w-full" />
      ))}
    </div>
  );
}
