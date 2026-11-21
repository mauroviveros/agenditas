import { SectionCard } from "@/components/section-card";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = 7;

// Esqueleto de la semana: el mismo marco y filas de la misma altura que las reales (64 px en
// celu, 56 px desde md), para que no salte cuando llega el contenido.
export function HoursSkeleton() {
  return (
    <SectionCard
      id="week-title"
      title="Tu semana"
      description={
        <>
          <Skeleton className="h-5 w-72 max-w-full" />
          <Skeleton className="mt-1 h-5 w-56 max-w-full" />
        </>
      }
    >
      <ul aria-hidden className="divide-y divide-border">
        {Array.from({ length: DAYS }, (_, day) => (
          <li key={day} className="flex h-16 items-center px-6 md:h-14">
            <Skeleton className="h-5 w-24" />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
