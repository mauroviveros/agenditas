import { Skeleton } from "@/components/ui/skeleton";
import { HolidaysCardSkeleton } from "./holidays/skeleton";
import { HoursFormSkeleton } from "./hours/skeleton";

// Esqueleto de Horarios: título, bajada, los siete días y los feriados.
export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-1/2 md:h-11" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <HoursFormSkeleton />
      <HolidaysCardSkeleton />
    </div>
  );
}
