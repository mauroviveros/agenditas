import { Suspense } from "react";
import { getDayAgenda } from "@/lib/appointments/queries";
import { describeDay } from "@/lib/appointments/summary";
import { buildTimeline, openSpans } from "@/lib/appointments/timeline";
import { getMyHours } from "@/lib/hours/queries";
import { AutoRefresh } from "./auto-refresh";
import { DayHeader } from "./header";
import { DayAgendaSkeleton } from "./skeleton";
import { Timeline } from "./timeline";

// El día con su esqueleto mientras carga.
export function DayAgenda({ day, today }: { day: string; today: string }) {
  return (
    <Suspense fallback={<DayAgendaSkeleton />}>
      <DayAgendaLoader day={day} today={today} />
    </Suspense>
  );
}

// Lee los turnos del día y los horarios del negocio. Sin try/catch a propósito: si una lectura
// falla, el error sube a (app)/error.tsx; mostrar un día vacío invitaría a agendar sobre turnos
// que sí existen.
async function DayAgendaLoader({ day, today }: { day: string; today: string }) {
  const now = new Date();
  const [items, ranges] = await Promise.all([getDayAgenda(day), getMyHours()]);
  const timeline = buildTimeline(day, items, ranges, now);
  const appointments = items.filter(({ kind }) => kind === "appointment").length;

  return (
    <section aria-labelledby="agenda-heading" className="flex flex-col gap-4">
      <DayHeader
        day={day}
        today={today}
        summary={describeDay(appointments, openSpans(day, ranges))}
      />
      <Timeline timeline={timeline} now={now} />
      {day === today ? <AutoRefresh /> : null}
    </section>
  );
}
