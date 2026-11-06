import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Agenda · Agenditas" };

// shortcut: estado vacío sin acción hasta que exista el alta del negocio (rebanada 2).
export default function AgendaPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <CalendarDays aria-hidden className="size-6 text-muted-foreground" />
      <h1 className="mt-4 font-semibold text-lg">Tu agenda está por acá</h1>
      <p className="mt-1 text-foreground-2">
        Cuando cargues tu negocio, vas a ver los turnos del día.
      </p>
    </div>
  );
}
