import { Skeleton } from "@/components/ui/skeleton";

const DAYS = 7;

// Esqueleto del formulario: una fila por día de la semana.
export function HoursFormSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: DAYS }, (_, day) => (
        <Skeleton key={day} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
