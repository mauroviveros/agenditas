import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { WeekStrip } from "../components/WeekStrip";
import { requireBusiness } from "../lib/guards";
import { usePageTitle } from "../lib/page-title";
import { monthName, weekOf } from "../lib/week";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: HomePage,
});

const STEPS = [
  { label: "Cargá tus servicios", active: true },
  { label: "Elegí tus horarios", active: false },
  { label: "Compartí tu link", active: false },
];

function HomePage() {
  const { business } = Route.useRouteContext();
  const now = new Date();
  usePageTitle(`Agenda de ${business.name}`);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <header className="px-5 pb-1 pt-6">
        <p className="text-muted-foreground">{business.name}</p>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
          {monthName(now, TIME_ZONE)}
        </h1>
      </header>
      <WeekStrip days={weekOf(now, TIME_ZONE)} />
      <div className="flex justify-between border-y border-border bg-surface px-5 py-2.5 text-muted-foreground">
        <span>Sin turnos hoy</span>
        <span className="font-mono">hoy</span>
      </div>
      <section className="m-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold leading-[26px]">Armá tu agenda</h2>
        <ol className="my-3 space-y-1">
          {STEPS.map((step, index) => (
            <li
              key={step.label}
              className={`flex items-center gap-2.5 py-1.5 ${step.active ? "font-semibold" : "text-muted-foreground"}`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full font-mono text-xs ${
                  step.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-sunken text-foreground"
                }`}
              >
                {index + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
        {/* shortcut: sin destino hasta R2 (servicios), por eso va deshabilitado. */}
        <Button disabled>Cargar servicios</Button>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Lo habilitamos en la próxima actualización.
        </p>
      </section>
      <BottomNav />
    </div>
  );
}
