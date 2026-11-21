import { Suspense } from "react";
import { getDayAgenda } from "@/lib/appointments/queries";
import { formatDate, formatTime } from "@/lib/time";
import { DayAgendaSkeleton } from "./skeleton";

// El día con su esqueleto mientras carga.
export function DayAgenda({ day, today }: { day: string; today: string }) {
  return (
    <Suspense fallback={<DayAgendaSkeleton />}>
      <DayAgendaLoader day={day} today={today} />
    </Suspense>
  );
}

// Lee los turnos del día. Sin try/catch a propósito: si la lectura falla, el error sube a
// (app)/error.tsx; mostrar un día vacío invitaría a agendar sobre turnos que sí existen.
// shortcut: lista sin diseño, con los datos reales; el bloque de la pantalla del día la reemplaza.
async function DayAgendaLoader({ day, today }: { day: string; today: string }) {
  const items = await getDayAgenda(day);

  return (
    <section aria-labelledby="agenda-heading" className="flex flex-col gap-4">
      <h2 id="agenda-heading" className="font-medium">
        {formatDate(day, today)}
      </h2>
      {items.length === 0 ? (
        <p>No hay turnos este día.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              {formatTime(item.startsAt)}–{formatTime(item.endsAt)} ·{" "}
              {item.kind === "block" ? "Bloqueado" : `${item.clientName} · ${item.serviceName}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
