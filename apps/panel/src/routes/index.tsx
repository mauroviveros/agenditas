import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { Button, buttonClasses } from "../components/Button";
import { WeekStrip } from "../components/WeekStrip";
import { requireBusiness } from "../lib/guards";
import { weeklyHoursQuery } from "../lib/hours";
import { usePageTitle } from "../lib/page-title";
import { servicesQuery } from "../lib/services";
import { monthName, weekOf } from "../lib/week";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: HomePage,
});

function HomePage() {
  const { business } = Route.useRouteContext();
  const now = new Date();
  usePageTitle(`Agenda de ${business.name}`);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <header className="px-5 pb-1 pt-6">
        <p className="text-muted-foreground">{business.name}</p>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
          {monthName(now, business.time_zone)}
        </h1>
      </header>
      <WeekStrip days={weekOf(now, business.time_zone)} />
      <div className="flex justify-between border-y border-border bg-surface px-5 py-2.5 text-muted-foreground">
        <span>Sin turnos hoy</span>
        <span className="font-mono">hoy</span>
      </div>
      <SetupSteps />
      <BottomNav />
    </div>
  );
}

type StepKey = "services" | "hours" | "link";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "services", label: "Cargá tus servicios" },
  { key: "hours", label: "Elegí tus horarios" },
  { key: "link", label: "Compartí tu link" },
];

function SetupSteps() {
  const services = useQuery(servicesQuery);
  const hours = useQuery(weeklyHoursQuery);
  const loading = services.isPending || hours.isPending;
  const done: Record<StepKey, boolean> = {
    services: (services.data?.length ?? 0) > 0,
    hours: (hours.data?.length ?? 0) > 0,
    link: false,
  };
  const current = STEPS.find((step) => !done[step.key])?.key ?? "link";

  return (
    <section className="m-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold leading-[26px]">Armá tu agenda</h2>
      <ol className="my-3 space-y-1">
        {STEPS.map((step, index) => (
          <li
            key={step.key}
            className={`flex items-center gap-2.5 py-1.5 ${
              step.key === current ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid size-5 place-items-center rounded-full font-mono text-xs ${
                step.key === current
                  ? "bg-primary text-primary-foreground"
                  : "bg-sunken text-foreground"
              }`}
            >
              {done[step.key] ? "✓" : index + 1}
            </span>
            {step.label}
            {done[step.key] ? <span className="sr-only"> (listo)</span> : null}
          </li>
        ))}
      </ol>
      {loading ? null : <SetupAction current={current} />}
    </section>
  );
}

function SetupAction({ current }: { current: StepKey }) {
  if (current === "services")
    return (
      <Link to="/servicios/nuevo" className={buttonClasses()}>
        Cargar servicios
      </Link>
    );
  if (current === "hours")
    return (
      <Link to="/horarios" className={buttonClasses()}>
        Elegir horarios
      </Link>
    );
  return (
    <>
      {/* shortcut: el link público llega con R3 (página pública), por eso va deshabilitado. */}
      <Button disabled>Compartir mi link</Button>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Lo habilitamos en la próxima actualización.
      </p>
    </>
  );
}
