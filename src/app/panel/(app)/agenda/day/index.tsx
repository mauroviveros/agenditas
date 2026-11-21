import { Suspense } from "react";
import { getDayAgenda } from "@/lib/appointments/queries";
import { describeDay } from "@/lib/appointments/summary";
import { buildTimeline, openSpans } from "@/lib/appointments/timeline";
import { getHolidaysBetween } from "@/lib/holidays/queries";
import { getMyHours } from "@/lib/hours/queries";
import { getMyServices } from "@/lib/services/queries";
import { shiftDay } from "@/lib/appointments/day";
import { AutoRefresh } from "./auto-refresh";
import { DayHeader } from "./header";
import { DayAgendaSkeleton } from "./skeleton";
import { AgendaView } from "./view";

// Los feriados que conoce el formulario para avisar: un mes atrás y un año adelante de hoy.
const HOLIDAYS_BEFORE_DAYS = 30;
const HOLIDAYS_AFTER_DAYS = 365;

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
  const [items, ranges, services, holidays] = await Promise.all([
    getDayAgenda(day),
    getMyHours(),
    getMyServices(),
    getHolidaysBetween(shiftDay(today, -HOLIDAYS_BEFORE_DAYS), shiftDay(today, HOLIDAYS_AFTER_DAYS)),
  ]);
  const timeline = buildTimeline(day, items, ranges, now);
  const appointments = items.filter(({ kind }) => kind === "appointment").length;

  return (
    <section aria-labelledby="agenda-heading" className="flex flex-col gap-4">
      <DayHeader
        day={day}
        today={today}
        summary={describeDay(appointments, openSpans(day, ranges))}
      />
      {/* Con `key`, cada día arranca con la pantalla limpia: sin avisos ni formularios del anterior. */}
      <AgendaView
        key={day}
        day={day}
        today={today}
        nowIso={now.toISOString()}
        timeline={timeline}
        items={items}
        services={services}
        ranges={ranges}
        holidays={holidays}
      />
      {day === today ? <AutoRefresh /> : null}
    </section>
  );
}
