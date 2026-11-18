"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { type HourRange, hoursSchema } from "@/lib/hours";
import { PanelFooter } from "../slots";
import { saveHours } from "./actions";
import { DayListRow } from "./day-list-row";
import { DayRow } from "./day-row";
import { DaySheet } from "./day-sheet";
import {
  copyDay,
  rangesFromWeek,
  type Slot,
  toggleDay,
  type Week,
  weekDuration,
  weekFromRanges,
  WORKWEEK,
} from "./week";

type Status =
  { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

const replaceDay = (week: Week, day: number, slots: readonly Slot[]): Week =>
  week.map((current, index) => (index === day ? slots : current));

// Avisos de la validación, ubicados en su franja (día y posición dentro del día). Los que
// no son de una franja (por ejemplo, demasiadas) van aparte.
function placeIssues(
  week: Week,
  issues: readonly { path: PropertyKey[]; message: string }[],
) {
  const positions = week.flatMap((slots, day) =>
    slots.map((_, slot) => ({ day, slot })),
  );
  const byDay = new Map<number, Map<number, string>>();
  const general: string[] = [];
  for (const { path, message } of issues) {
    const position =
      typeof path[0] === "number" ? positions[path[0]] : undefined;
    if (position) {
      const slots = byDay.get(position.day) ?? new Map<number, string>();
      slots.set(position.slot, slots.get(position.slot) ?? message);
      byDay.set(position.day, slots);
    } else {
      general.push(message);
    }
  }
  return { byDay, general };
}

const NO_ERRORS: ReadonlyMap<number, string> = new Map();

// La semana completa. Se edita en pantalla y se guarda de una vez (reemplaza lo anterior).
// En escritorio cada día se edita en su fila; en el celu, en una hoja que se abre al tocarlo.
export function HoursForm({ initial }: { initial: readonly HourRange[] }) {
  const formId = useId();
  const [week, setWeek] = useState<Week>(() => weekFromRanges(initial));
  const [sheetDay, setSheetDay] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const ranges = rangesFromWeek(week);
  const parsed = hoursSchema.safeParse(ranges);
  const { byDay, general } = placeIssues(
    week,
    parsed.success ? [] : parsed.error.issues,
  );
  // Se compara ordenado: cambiar una hora no debería marcar cambios si queda igual.
  const normalize = (list: readonly HourRange[]) =>
    JSON.stringify(rangesFromWeek(weekFromRanges(list)));
  const isDirty = normalize(ranges) !== normalize(initial);

  const edit = (next: Week) => {
    setWeek(next);
    setStatus({ kind: "idle" });
  };

  const applySheet = (
    day: number,
    slots: readonly Slot[],
    toWorkweek: boolean,
  ) => {
    const next = replaceDay(week, day, slots);
    edit(toWorkweek ? copyDay(next, day, WORKWEEK) : next);
    setSheetDay(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.success) {
      return;
    }
    startTransition(async () => {
      const result = await saveHours(parsed.data);
      setStatus(
        result.ok
          ? { kind: "saved" }
          : { kind: "error", message: result.error },
      );
    });
  };

  const notice =
    status.kind === "error" ? status.message : (general[0] ?? null);
  const showBar = isDirty || status.kind !== "idle" || notice !== null;

  return (
    <form
      id={formId}
      onSubmit={submit}
      className="flex flex-col gap-4"
      noValidate
    >
      <Card role="region" aria-labelledby="week-title" className="gap-0 py-0">
        <CardHeader className="border-b px-6 pt-5">
          <CardTitle
            id="week-title"
            role="heading"
            aria-level={2}
            className="text-xl font-semibold tracking-tight"
          >
            Tu semana
          </CardTitle>
          <CardDescription>
            <span className="tabular-nums">{weekDuration(week)}</span> por
            semana · el almuerzo es el corte entre dos franjas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul data-slot="week" className="divide-y divide-border">
            {week.map((slots, day) => (
              <li key={day}>
                <div className="hidden md:block">
                  <DayRow
                    day={day}
                    slots={slots}
                    errors={byDay.get(day) ?? NO_ERRORS}
                    onToggle={() => edit(toggleDay(week, day))}
                    onChange={(next) => edit(replaceDay(week, day, next))}
                  />
                </div>
                <div className="md:hidden">
                  <DayListRow
                    day={day}
                    slots={slots}
                    onToggle={() => edit(toggleDay(week, day))}
                    onOpen={() => setSheetDay(day)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {sheetDay !== null ? (
        <DaySheet
          key={sheetDay}
          day={sheetDay}
          initial={
            week[sheetDay]?.length
              ? (week[sheetDay] ?? [])
              : (toggleDay(week, sheetDay)[sheetDay] ?? [])
          }
          onApply={(slots, toWorkweek) =>
            applySheet(sheetDay, slots, toWorkweek)
          }
          onClose={() => setSheetDay(null)}
        />
      ) : null}

      {showBar ? (
        <PanelFooter>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p
              role={notice ? "alert" : "status"}
              className="flex min-h-5 flex-1 items-center gap-1.5 text-sm font-semibold"
            >
              {notice ? (
                <>
                  <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
                  {notice}
                </>
              ) : status.kind === "saved" ? (
                <>
                  <CircleCheckIcon aria-hidden className="size-4 shrink-0" />
                  Listo, guardamos tus horarios.
                </>
              ) : (
                "Cambios sin guardar"
              )}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="h-11"
                disabled={!isDirty || isPending}
                onClick={() => edit(weekFromRanges(initial))}
              >
                Descartar
              </Button>
              <Button
                type="submit"
                // El botón vive en el pie del panel, fuera del <form> en el DOM.
                form={formId}
                size="lg"
                className="h-11 flex-1"
                disabled={!isDirty || !parsed.success || isPending}
                aria-busy={isPending}
              >
                {isPending ? <Spinner aria-hidden /> : null}
                {isPending ? "Guardando…" : "Guardar horarios"}
              </Button>
            </div>
          </div>
        </PanelFooter>
      ) : null}
    </form>
  );
}
