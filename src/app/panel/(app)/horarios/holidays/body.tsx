import { Badge } from "@/components/ui/badge";
import type { HolidayRow } from "@/lib/holidays/parse";
import { formatDate } from "@/lib/time";

// Lo que va dentro de la card según el caso: la lista, el aviso de vacío o el de error.

// Las filas: la fecha arriba, el nombre abajo y, en los puentes, el Badge.
export function HolidaysBody({ holidays }: { holidays: readonly HolidayRow[] }) {
  return (
    <ul className="divide-y divide-border">
      {holidays.map(({ date, name, kind }) => (
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

// Nadie corrió todavía `pnpm holidays:sync`: no hay feriados cargados.
export function HolidaysEmpty() {
  return <p className="px-6 py-4 text-muted-foreground">No hay feriados cargados.</p>;
}

export function HolidaysError() {
  return (
    <p role="alert" className="px-6 py-4 text-muted-foreground">
      No pudimos leer los feriados. Probá de nuevo en un rato.
    </p>
  );
}
