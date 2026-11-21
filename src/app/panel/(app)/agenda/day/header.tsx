import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { shiftDay } from "@/lib/appointments/day";
import { formatDate } from "@/lib/time";

// Hoy no lleva ?dia: es la ruta sin parámetro, así «Hoy» y el día de hoy son la misma URL.
const agendaHref = (day: string, today: string) =>
  day === today ? "/panel/agenda" : `/panel/agenda?dia=${day}`;

// La fecha del día con su bajada, y los botones para ir al día anterior, a hoy y al siguiente.
export function DayHeader({ day, today, summary }: { day: string; today: string; summary: string }) {
  const isToday = day === today;

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 id="agenda-heading" className="font-medium">
          {formatDate(day, today)}
        </h2>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>
      <nav aria-label="Cambiar de día" className="flex gap-1">
        <Link
          href={agendaHref(shiftDay(day, -1), today)}
          aria-label="Día anterior"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ChevronLeftIcon aria-hidden />
        </Link>
        <Link
          href="/panel/agenda"
          aria-current={isToday ? "date" : undefined}
          className={buttonVariants({ variant: isToday ? "secondary" : "outline" })}
        >
          Hoy
        </Link>
        <Link
          href={agendaHref(shiftDay(day, 1), today)}
          aria-label="Día siguiente"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ChevronRightIcon aria-hidden />
        </Link>
      </nav>
    </div>
  );
}
