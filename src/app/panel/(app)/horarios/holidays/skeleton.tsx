import { Skeleton } from "@/components/ui/skeleton";
import { HolidaysCard } from "./card";

const ROWS = 5;

// Esqueleto de la card de feriados: el mismo marco y filas de la misma altura que las
// reales (dos líneas de texto con su relleno), para que no salte cuando llega el contenido.
export function HolidaysCardSkeleton() {
  return (
    <HolidaysCard>
      <ul aria-hidden className="divide-y divide-border">
        {Array.from({ length: ROWS }, (_, row) => (
          <li key={row} className="flex flex-col gap-0.5 px-6 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-64 max-w-full" />
          </li>
        ))}
      </ul>
    </HolidaysCard>
  );
}
