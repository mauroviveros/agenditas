import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { datesBetween } from "../lib/dates";
import { scheduleErrorMessage } from "../lib/errors";
import { addOverrides, overridesQuery } from "../lib/overrides";
import { Button } from "./Button";
import { Field } from "./Field";

const MAX_DAYS = 60;
const NOTE_MAX = 120;

interface CloseDaysFormProps {
  businessId: string;
  today: string;
  onDone: () => void;
}

// Cerrar un día o un tramo seguido (vacaciones): una fila por fecha, todas o ninguna.
export function CloseDaysForm({
  businessId,
  today,
  onDone,
}: CloseDaysFormProps) {
  const queryClient = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: (dates: string[]) =>
      addOverrides(businessId, dates, "closed", note.trim() || null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: overridesQuery.queryKey,
      });
      onDone();
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const last = to || from;
    if (from === "" || from < today) {
      setProblem("Elegí una fecha desde hoy.");
      return;
    }
    const dates = datesBetween(from, last);
    if (dates.length === 0) {
      setProblem(
        "La fecha final tiene que ser igual o posterior a la inicial.",
      );
      return;
    }
    if (dates.length > MAX_DAYS) {
      setProblem(`Podés cerrar hasta ${MAX_DAYS} días seguidos.`);
      return;
    }
    setProblem(null);
    add.mutate(dates);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-4 rounded-lg border border-border bg-surface p-4"
    >
      <Field
        label="Desde"
        type="date"
        min={today}
        required
        value={from}
        onChange={(event) => setFrom(event.target.value)}
      />
      <Field
        label="Hasta (opcional)"
        type="date"
        min={from || today}
        value={to}
        onChange={(event) => setTo(event.target.value)}
      />
      <Field
        label="Motivo (opcional)"
        maxLength={NOTE_MAX}
        autoComplete="off"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {problem || add.isError ? (
        <p role="alert" className="text-destructive">
          {problem ?? scheduleErrorMessage(add.error)}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={add.isPending}>
          {add.isPending ? "Cerrando…" : "Cerrar"}
        </Button>
      </div>
    </form>
  );
}
