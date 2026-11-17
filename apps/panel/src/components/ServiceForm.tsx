import { formatDuration } from "@agenditas/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { serviceErrorMessage } from "../lib/errors";
import {
  archiveService,
  createService,
  type Service,
  servicesQuery,
  updateService,
} from "../lib/services";
import { Button } from "./Button";
import { Field } from "./Field";

const STEP_MINUTES = 5;
const MIN_MINUTES = 5;
const MAX_MINUTES = 480;
const DEFAULT_MINUTES = 30;
const PRESETS = [15, 30, 45, 60, 90] as const;
const STEP_BUTTON =
  "grid size-12 place-items-center rounded-md border border-control bg-surface text-xl font-semibold focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40";

interface ServiceFormProps {
  businessId: string;
  service?: Service;
}

function clampMinutes(minutes: number): number {
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, minutes));
}

export function ServiceForm({ businessId, service }: ServiceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(service?.name ?? "");
  const [minutes, setMinutes] = useState(
    service?.duration_minutes ?? DEFAULT_MINUTES,
  );
  const [price, setPrice] = useState(
    service?.price_ars === null || service === undefined
      ? ""
      : String(service.price_ars),
  );
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  async function backToList() {
    await queryClient.invalidateQueries({ queryKey: servicesQuery.queryKey });
    await navigate({ to: "/servicios" });
  }

  const save = useMutation({
    mutationFn: () => {
      const input = {
        name: name.trim(),
        duration_minutes: minutes,
        price_ars: price === "" ? null : Number(price),
      };
      return service
        ? updateService(service.id, input)
        : createService(businessId, input);
    },
    onSuccess: backToList,
  });
  const archive = useMutation({
    mutationFn: () => archiveService(service?.id ?? ""),
    onSuccess: backToList,
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (name.trim() !== "") save.mutate();
  }

  const busy = save.isPending || archive.isPending;

  return (
    <form onSubmit={handleSubmit} className="mx-5 space-y-5">
      <Field
        label="Nombre"
        name="name"
        maxLength={80}
        required
        autoComplete="off"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold">Duración</legend>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Restar 5 minutos"
            className={STEP_BUTTON}
            onClick={() => setMinutes(clampMinutes(minutes - STEP_MINUTES))}
          >
            −
          </button>
          <output
            aria-live="polite"
            className="font-mono text-xl font-semibold"
          >
            {formatDuration(minutes)}
          </output>
          <button
            type="button"
            aria-label="Sumar 5 minutos"
            className={STEP_BUTTON}
            onClick={() => setMinutes(clampMinutes(minutes + STEP_MINUTES))}
          >
            +
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={minutes === preset}
              onClick={() => setMinutes(preset)}
              className="h-11 rounded-full border border-control bg-surface px-4 font-mono font-medium focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-surface"
            >
              {formatDuration(preset)}
            </button>
          ))}
        </div>
      </fieldset>
      <Field
        label="Precio (opcional)"
        name="price"
        prefix="$"
        inputMode="numeric"
        maxLength={9}
        autoComplete="off"
        value={price}
        onChange={(event) => setPrice(event.target.value.replace(/\D/g, ""))}
        hint="Si lo dejás vacío, tus clientes ven «Consultar»."
      />
      {save.isError ? (
        <p role="alert" className="text-destructive">
          {serviceErrorMessage(save.error)}
        </p>
      ) : null}
      <Button type="submit" disabled={name.trim() === "" || busy}>
        {save.isPending ? "Guardando…" : "Guardar"}
      </Button>
      {service ? (
        <ArchiveBlock
          serviceName={service.name}
          confirming={confirmingArchive}
          pending={archive.isPending}
          failed={archive.isError}
          onAsk={() => setConfirmingArchive(true)}
          onCancel={() => setConfirmingArchive(false)}
          onConfirm={() => archive.mutate()}
        />
      ) : null}
    </form>
  );
}

interface ArchiveBlockProps {
  serviceName: string;
  confirming: boolean;
  pending: boolean;
  failed: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function ArchiveBlock({
  serviceName,
  confirming,
  pending,
  failed,
  onAsk,
  onCancel,
  onConfirm,
}: ArchiveBlockProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const confirmBox = useRef<HTMLFieldSetElement>(null);
  const mounted = useRef(false);

  // El botón y la confirmación se reemplazan: el foco acompaña al que aparece.
  useEffect(() => {
    if (mounted.current) {
      (confirming ? confirmBox : trigger).current?.focus();
    }
    mounted.current = true;
  }, [confirming]);

  if (!confirming) {
    return (
      <Button
        ref={trigger}
        variant="secondary"
        className="border-destructive text-destructive"
        onClick={onAsk}
      >
        Archivar servicio
      </Button>
    );
  }
  return (
    <fieldset
      ref={confirmBox}
      tabIndex={-1}
      className="min-w-0 rounded-lg border border-destructive bg-surface p-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <legend className="sr-only">Confirmar archivo</legend>
      <p>
        ¿Archivar «{serviceName}»? Tus clientes dejan de verlo y no se pueden
        sacar turnos nuevos.
      </p>
      {failed ? (
        <p role="alert" className="mt-2 text-destructive">
          No pudimos archivarlo. Probá de nuevo.
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="bg-destructive"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? "Archivando…" : "Archivar"}
        </Button>
      </div>
    </fieldset>
  );
}
