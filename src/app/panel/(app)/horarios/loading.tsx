import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto de Horarios: título, bajada y los siete días.
export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-1/2 md:h-11" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 7 }, (_, day) => (
          <Skeleton key={day} className="h-24 rounded-tarjeta" />
        ))}
      </div>
    </div>
  );
}
