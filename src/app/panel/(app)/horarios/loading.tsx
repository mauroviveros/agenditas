import { Skeleton } from "@/components/ui/skeleton";
import { HolidaysCardSkeleton } from "./holidays/skeleton";
import { HoursFormSkeleton } from "./hours/skeleton";

// Esqueleto de Horarios: la ayuda, los siete días y los feriados (el encabezado lo pone el layout).
export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Skeleton className="h-5 w-4/5" />
      <HoursFormSkeleton />
      <HolidaysCardSkeleton />
    </div>
  );
}
