import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HolidayRow } from "@/lib/holidays";
import { formatearFecha } from "@/lib/hora";
import { getUpcomingHolidays } from "@/lib/session";

const SKELETON_ROWS = 5;

type Holidays = { holidays: HolidayRow[] } | { failed: true };

// Los próximos feriados. Si falla la lectura se avisa dentro de la card: los horarios
// siguen usables.
export async function UpcomingHolidays() {
  let result: Holidays;
  try {
    result = { holidays: await getUpcomingHolidays() };
  } catch (error) {
    console.error(error);
    result = { failed: true };
  }
  return <HolidaysCard result={result} />;
}

export function HolidaysCard({ result }: { result: Holidays }) {
  return (
    <Card role="region" aria-labelledby="holidays-title" className="gap-0 py-0">
      <CardHeader className="border-b px-6 pt-5">
        <CardTitle
          id="holidays-title"
          role="heading"
          aria-level={2}
          className="text-xl font-semibold tracking-tight"
        >
          Próximos feriados
        </CardTitle>
        <CardDescription>Para que no te agarren de sorpresa.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <HolidaysBody result={result} />
      </CardContent>
    </Card>
  );
}

function HolidaysBody({ result }: { result: Holidays }) {
  if ("failed" in result) {
    return (
      <p role="alert" className="px-6 py-4 text-muted-foreground">
        No pudimos leer los feriados. Probá de nuevo en un rato.
      </p>
    );
  }
  if (result.holidays.length === 0) {
    return <p className="px-6 py-4 text-muted-foreground">No hay feriados cargados.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {result.holidays.map(({ date, name, kind }) => (
        <li key={date} className="flex items-center gap-3 px-6 py-3">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-muted-foreground first-letter:uppercase">
              {formatearFecha(date)}
            </span>
            <span className="font-medium">{name}</span>
          </span>
          {kind === "bridge" && <Badge variant="secondary">Puente</Badge>}
        </li>
      ))}
    </ul>
  );
}

export function HolidaysCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-7 w-1/3" />
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <Skeleton key={row} className="h-10 rounded-xl" />
      ))}
    </div>
  );
}
