import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { CloseDaysForm } from "../components/CloseDaysForm";
import { PageHeader } from "../components/PageHeader";
import { LoadError, LoadingNote } from "../components/QueryState";
import { Toggle } from "../components/Toggle";
import { type ClosedRange, groupClosedDays } from "../lib/closed-days";
import { formatShortDate, todayIn } from "../lib/dates";
import { scheduleErrorMessage } from "../lib/errors";
import { requireBusiness } from "../lib/guards";
import { type Holiday, holidaysQuery, upcomingHolidays } from "../lib/holidays";
import {
  addOverrides,
  type DayOverride,
  overridesQuery,
  removeOverrides,
} from "../lib/overrides";
import { usePageTitle } from "../lib/page-title";

export const Route = createFileRoute("/dias-cerrados")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: ClosedDaysPage,
});

function rangeLabel(range: ClosedRange): string {
  return range.from === range.to
    ? formatShortDate(range.from)
    : `${formatShortDate(range.from)} al ${formatShortDate(range.to)}`;
}

function ClosedDaysPage() {
  usePageTitle("Días cerrados");
  const { business } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const today = todayIn(business.time_zone);
  const overrides = useQuery(overridesQuery);
  const holidays = useQuery(holidaysQuery(Number(today.slice(0, 4))));
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const wasAdding = useRef(false);

  // Al cerrar el formulario el foco vuelve al botón que lo abrió.
  useEffect(() => {
    if (wasAdding.current && !adding) addButton.current?.focus();
    wasAdding.current = adding;
  }, [adding]);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: overridesQuery.queryKey });
  const toggleHoliday = useMutation({
    mutationFn: ({ holiday, open }: { holiday: Holiday; open: boolean }) =>
      open
        ? addOverrides(business.id, [holiday.date], "open", holiday.name)
        : removeOverrides([holiday.date]),
    onSuccess: refresh,
  });
  const removeRange = useMutation({
    mutationFn: (range: ClosedRange) => removeOverrides(range.dates),
    onSuccess: refresh,
  });

  const openDates = new Set(
    (overrides.data ?? [])
      .filter((override: DayOverride) => override.kind === "open")
      .map((override) => override.on_date),
  );
  const closedRanges = groupClosedDays(
    (overrides.data ?? []).filter(
      (override) => override.kind === "closed" && override.on_date >= today,
    ),
  );
  const mutationError = toggleHoliday.error ?? removeRange.error;

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <PageHeader backTo="/mas" backLabel="Más" title="Días cerrados">
        <p className="text-muted-foreground">
          En los feriados no atendés, salvo que marques «Abro».
        </p>
      </PageHeader>

      <section aria-labelledby="holidays-title" className="mx-5">
        <h2 id="holidays-title" className="mb-2 font-semibold">
          Próximos feriados
        </h2>
        {holidays.isPending ? <LoadingNote /> : null}
        {holidays.isError ? (
          <div
            role="alert"
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p>
              No pudimos traer los feriados. Podés cerrar días a mano igual.
            </p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => holidays.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : null}
        {holidays.data ? (
          <ul className="space-y-2">
            {upcomingHolidays(holidays.data, today).map((holiday) => {
              const open = openDates.has(holiday.date);
              return (
                <li
                  key={holiday.date}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface py-1.5 pl-4 pr-1"
                >
                  <span>
                    <span className="block font-semibold">{holiday.name}</span>
                    <span className="block font-mono text-muted-foreground">
                      {formatShortDate(holiday.date)}
                    </span>
                  </span>
                  <span className="flex items-center text-muted-foreground">
                    {open ? "Abro" : "Cerrado"}
                    <Toggle
                      label={`Abro el ${holiday.name}`}
                      checked={open}
                      disabled={overrides.isPending}
                      onChange={(next) => {
                        if (!toggleHoliday.isPending)
                          toggleHoliday.mutate({ holiday, open: next });
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="closed-title" className="mx-5 mt-6">
        <h2 id="closed-title" className="mb-2 font-semibold">
          Tus días cerrados
        </h2>
        {overrides.isError ? (
          <LoadError
            message="No pudimos traer tus días cerrados."
            onRetry={() => overrides.refetch()}
          />
        ) : null}
        {overrides.data && closedRanges.length === 0 && !adding ? (
          <p className="mb-3 text-muted-foreground">
            Todavía no cerraste ningún día. Usá esto para vacaciones o un
            imprevisto.
          </p>
        ) : null}
        <ul className="space-y-2">
          {closedRanges.map((range) => (
            <li
              key={range.from}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface py-1.5 pl-4 pr-2"
            >
              <span>
                <span className="block font-semibold">
                  {range.note ?? "Cerrado"}
                </span>
                <span className="block font-mono text-muted-foreground">
                  {rangeLabel(range)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Quitar ${range.note ?? "cierre"} del ${rangeLabel(range)}`}
                disabled={removeRange.isPending}
                onClick={() => removeRange.mutate(range)}
                className="grid size-11 place-items-center rounded-md text-xl focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
        {mutationError ? (
          <p role="alert" className="mt-2 text-destructive">
            {scheduleErrorMessage(mutationError)}
          </p>
        ) : null}
        {adding ? (
          <CloseDaysForm
            businessId={business.id}
            today={today}
            onDone={() => setAdding(false)}
          />
        ) : (
          <Button
            ref={addButton}
            variant="secondary"
            className="mt-3"
            onClick={() => setAdding(true)}
          >
            Cerrar un día
          </Button>
        )}
      </section>
      <BottomNav />
    </div>
  );
}
