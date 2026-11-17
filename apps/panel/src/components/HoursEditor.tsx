import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { scheduleErrorMessage } from "../lib/errors";
import { saveWeeklyHours, weeklyHoursQuery } from "../lib/hours";
import {
  type DayDraft,
  draftsFromRows,
  hoursPayload,
  validateDay,
  WEEKDAY_LABELS,
  type WeeklyHoursRow,
} from "../lib/schedule";
import { Button } from "./Button";
import { TimeSelect } from "./TimeSelect";
import { Toggle } from "./Toggle";

interface HoursEditorProps {
  rows: readonly WeeklyHoursRow[];
}

export function HoursEditor({ rows }: HoursEditorProps) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(() => draftsFromRows(rows));
  const problems = days.map(validateDay);
  const hasProblem = problems.some((problem) => problem !== null);

  function change(weekday: number, patch: Partial<DayDraft>) {
    setDays((current) =>
      current.map((day) =>
        day.weekday === weekday ? { ...day, ...patch } : day,
      ),
    );
  }

  const save = useMutation({
    mutationFn: () => saveWeeklyHours(hoursPayload(days)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: weeklyHoursQuery.queryKey }),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasProblem) save.mutate();
      }}
      className="mx-5 space-y-2"
    >
      {days.map((day, index) => (
        <DayCard
          key={day.weekday}
          day={day}
          problem={problems[index] ?? null}
          onChange={(patch) => change(day.weekday, patch)}
        />
      ))}
      {save.isError ? (
        <p role="alert" className="pt-2 text-destructive">
          {scheduleErrorMessage(save.error)}
        </p>
      ) : null}
      {save.isSuccess && !save.isPending ? (
        <output className="block pt-2 font-semibold text-primary">
          <span aria-hidden="true">✓ </span>Horarios guardados
        </output>
      ) : null}
      <div className="pt-2">
        <Button type="submit" disabled={hasProblem || save.isPending}>
          {save.isPending ? "Guardando…" : "Guardar horarios"}
        </Button>
      </div>
    </form>
  );
}

interface DayCardProps {
  day: DayDraft;
  problem: string | null;
  onChange: (patch: Partial<DayDraft>) => void;
}

function DayCard({ day, problem, onChange }: DayCardProps) {
  const label = WEEKDAY_LABELS[day.weekday - 1] ?? "";
  return (
    <section
      aria-label={label}
      className="rounded-lg border border-border bg-surface px-4 py-1.5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{label}</h2>
        <span className="flex items-center gap-1 text-muted-foreground">
          {day.open ? "Abierto" : "Cerrado"}
          <Toggle
            label={`${label} abierto`}
            checked={day.open}
            onChange={(open) => onChange({ open })}
          />
        </span>
      </div>
      {day.open ? (
        <div className="pb-3">
          <div className="flex items-end gap-3">
            <TimeSelect
              label="Abre"
              value={day.opens}
              onChange={(opens) => onChange({ opens })}
            />
            <TimeSelect
              label="Cierra"
              value={day.closes}
              onChange={(closes) => onChange({ closes })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Almuerzo</span>
            <Toggle
              label={`${label} con almuerzo`}
              checked={day.lunch}
              onChange={(lunch) => onChange({ lunch })}
            />
          </div>
          {day.lunch ? (
            <div className="flex items-end gap-3">
              <TimeSelect
                label="Almuerzo desde"
                value={day.lunchStarts}
                onChange={(lunchStarts) => onChange({ lunchStarts })}
              />
              <TimeSelect
                label="Almuerzo hasta"
                value={day.lunchEnds}
                onChange={(lunchEnds) => onChange({ lunchEnds })}
              />
            </div>
          ) : null}
          {problem ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {problem}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
