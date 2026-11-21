import { HolidaysCardSkeleton } from "./holidays/skeleton";
import { HoursFormSkeleton } from "./hours/skeleton";

// Esqueleto de Horarios: los siete días y los feriados (el encabezado lo pone el layout).
export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <HoursFormSkeleton />
      <HolidaysCardSkeleton />
    </div>
  );
}
