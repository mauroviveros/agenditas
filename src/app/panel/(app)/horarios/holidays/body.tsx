import { CircleAlertIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HolidayRow } from "@/lib/holidays/parse";
import { formatDate } from "@/lib/time";

// Lo que va dentro de la card según el caso: la lista, el aviso de vacío o el de error.

// Las filas: la fecha arriba (es lo que se busca), el nombre abajo, y a la derecha «Hoy» y,
// en los puentes, «Puente». `today` es "AAAA-MM-DD" en hora de Buenos Aires.
export function HolidaysBody({
  holidays,
  today,
}: {
  holidays: readonly HolidayRow[];
  today: string;
}) {
  return (
    // role="list": con las viñetas sacadas por el CSS, Safari deja de anunciarlo como lista.
    <ul role="list" className="divide-y divide-border">
      {holidays.map(({ date, name, kind }) => (
        <li key={date} className="flex items-center gap-3 px-6 py-3">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-medium first-letter:uppercase">{formatDate(date, today)}</span>
            <span className="break-words text-muted-foreground">{name}</span>
          </span>
          {date === today ? <Badge data-slot="holiday-today">Hoy</Badge> : null}
          {kind === "bridge" ? <Badge variant="secondary">Puente</Badge> : null}
        </li>
      ))}
    </ul>
  );
}

// Nadie corrió todavía `pnpm holidays:sync`, pero la persona que atiende no puede hacer
// nada con eso: el texto no habla de cargas.
export function HolidaysEmpty() {
  return <p className="px-6 py-4 text-muted-foreground">Todavía no hay feriados para mostrar.</p>;
}

// El aviso de error de DESIGN.md: texto con ícono, nunca solo color.
export function HolidaysError() {
  return (
    <div
      role="alert"
      className="m-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
    >
      <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
      <p className="font-medium">No pudimos leer los feriados. Probá de nuevo en un rato.</p>
    </div>
  );
}
