import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { HolidayRow } from "@/lib/holidays/parse";
import { formatDate } from "@/lib/time";

export type Holidays = { holidays: HolidayRow[] } | { failed: true };

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
              {formatDate(date)}
            </span>
            <span className="font-medium">{name}</span>
          </span>
          {kind === "bridge" && <Badge variant="secondary">Puente</Badge>}
        </li>
      ))}
    </ul>
  );
}
