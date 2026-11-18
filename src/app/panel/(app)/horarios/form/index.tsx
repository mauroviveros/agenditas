"use client";

import { CopyIcon } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type HourRange, hoursSchema } from "@/lib/hours/schema";
import { saveHours } from "../actions";
import { CopyDayMenu } from "./day/copy-menu";
import { DayRow } from "./day/row";
import { DaySheet } from "./day/sheet";
import { DaySummary } from "./day/summary";
import { FormFooter, SAVED_MESSAGE } from "./footer";
import { placeIssues } from "./issues";
import {
  copyDay,
  copyMessage,
  rangesFromWeek,
  replaceDay,
  type Slot,
  toggleDay,
  type Week,
  weekDuration,
  WEEKDAY_NAMES,
  weekFromRanges,
} from "./week";

type Status =
  { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

const NO_ERRORS: ReadonlyMap<number, string> = new Map();

// La semana completa. Se edita en pantalla y se guarda de una vez (reemplaza lo anterior).
// En escritorio cada día se edita en su fila; en el celu, en una hoja que se abre al tocarlo.
export function HoursForm({
  initial,
  today,
}: {
  initial: readonly HourRange[];
  /** Día de hoy en Buenos Aires: 0 = lunes … 6 = domingo. */
  today: number;
}) {
  const formId = useId();
  const [week, setWeek] = useState<Week>(() => weekFromRanges(initial));
  const [sheetDay, setSheetDay] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // La última copia a otros días, para poder deshacerla: la semana de antes y qué se dijo.
  const [lastCopy, setLastCopy] = useState<{
    previous: Week;
    message: string;
  } | null>(null);
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
    setLastCopy(null);
    setWeek(next);
    setStatus({ kind: "idle" });
  };

  const applyCopy = (day: number, next: Week, to: readonly number[]) => {
    setLastCopy({
      previous: week,
      message: copyMessage(WEEKDAY_NAMES[day] ?? "", to),
    });
    setWeek(next);
    setStatus({ kind: "idle" });
  };

  const undoCopy = () => {
    if (lastCopy) {
      setWeek(lastCopy.previous);
    }
    setLastCopy(null);
  };

  const applySheet = (
    day: number,
    slots: readonly Slot[],
    copyTo: readonly number[],
  ) => {
    const next = copyDay(replaceDay(week, day, slots), day, copyTo);
    if (copyTo.length === 0) {
      edit(next);
    } else {
      applyCopy(day, next, copyTo);
    }
    setSheetDay(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.success) {
      return;
    }
    startTransition(async () => {
      const result = await saveHours(parsed.data);
      if (result.ok) {
        setLastCopy(null);
      }
      setStatus(
        result.ok
          ? { kind: "saved" }
          : { kind: "error", message: result.error },
      );
    });
  };

  const notice =
    status.kind === "error" ? status.message : (general[0] ?? null);
  const showBar =
    isDirty || status.kind !== "idle" || notice !== null || lastCopy !== null;
  // Lo que anuncia el lector de pantalla. La región vive siempre en la página: una región
  // que aparece ya con texto no se anuncia de forma confiable.
  const liveMessage =
    notice ??
    (status.kind === "saved"
      ? SAVED_MESSAGE
      : (lastCopy?.message ?? (isDirty ? "Cambios sin guardar" : "")));

  return (
    <form
      id={formId}
      onSubmit={submit}
      className="flex flex-col gap-4"
      noValidate
    >
      <p role="status" className="sr-only">
        {liveMessage}
      </p>
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
                <div className="hidden md:flex md:items-center">
                  <div className="min-w-0 flex-1">
                    <DayRow
                      day={day}
                      isToday={day === today}
                      slots={slots}
                      errors={byDay.get(day) ?? NO_ERRORS}
                      onToggle={() => edit(toggleDay(week, day))}
                      onChange={(next) => edit(replaceDay(week, day, next))}
                    />
                  </div>
                  {slots.length > 0 ? (
                    <div data-slot="copy" className="pr-4">
                      <CopyDayMenu
                        dayName={WEEKDAY_NAMES[day]}
                        onCopy={(to) =>
                          applyCopy(day, copyDay(week, day, to), to)
                        }
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-lg"
                            className="size-11 text-muted-foreground"
                            aria-label={`Copiar el horario del ${WEEKDAY_NAMES[day]?.toLowerCase()} a otros días`}
                          />
                        }
                      >
                        <CopyIcon aria-hidden />
                      </CopyDayMenu>
                    </div>
                  ) : null}
                </div>
                <div className="md:hidden">
                  <DaySummary
                    day={day}
                    isToday={day === today}
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
          onApply={(slots, copyTo) => applySheet(sheetDay, slots, copyTo)}
          onClose={() => setSheetDay(null)}
        />
      ) : null}

      {showBar ? (
        <FormFooter
          formId={formId}
          notice={notice}
          saved={status.kind === "saved"}
          copyMessage={lastCopy?.message ?? null}
          isDirty={isDirty}
          canSave={parsed.success}
          isPending={isPending}
          onUndo={undoCopy}
          onDiscard={() => edit(weekFromRanges(initial))}
        />
      ) : null}
    </form>
  );
}
