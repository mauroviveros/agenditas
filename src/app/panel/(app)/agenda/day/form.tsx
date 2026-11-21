"use client";

import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { HolidayRow } from "@/lib/holidays/parse";
import type { HourRange } from "@/lib/hours/schema";
import type { Service } from "@/lib/services/queries";
import { formatPrice } from "@/lib/services/schema";
import { type AppointmentResult, createAppointment, moveAppointment } from "../actions";
import {
  type AppointmentDraft,
  type DraftErrors,
  endClock,
  parseDraft,
  parseMoveDraft,
  warningsOf,
} from "./draft";
import { ServicePicker } from "./service-picker";
import type { AppointmentItem } from "./timeline";

interface AppointmentFormProps {
  /** El turno que se mueve; sin él, el formulario agenda uno nuevo. */
  appointment: AppointmentItem | null;
  initial: AppointmentDraft;
  services: Service[];
  ranges: HourRange[];
  holidays: HolidayRow[];
  /** Se llama con el día en que quedó el turno. */
  onSaved: (day: string) => void;
  /** Cancela el turno que se mueve; si falla, el aviso se muestra acá. */
  onCancelAppointment: () => Promise<AppointmentResult>;
  onCancel: () => void;
}

// Servicio, cliente, teléfono, día y hora de un turno (o solo día y hora, al moverlo). Lo escrito se
// valida con las reglas del esquema antes de enviar; lo que rechaza la base vuelve como un aviso
// arriba de los botones. Los avisos de horario (almuerzo, fuera de horario, feriado) no frenan.
export function AppointmentForm({
  appointment,
  initial,
  services,
  ranges,
  holidays,
  onSaved,
  onCancelAppointment,
  onCancel,
}: AppointmentFormProps) {
  const [draft, setDraft] = useState<AppointmentDraft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [cancelling, startCancelling] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const groupName = useId();
  const clientId = useId();
  const phoneId = useId();
  const dayId = useId();
  const timeId = useId();
  const isMove = appointment !== null;

  // Tras un intento fallido, el foco va al primer campo con aviso.
  useEffect(() => {
    if (failedAttempts > 0) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [failedAttempts]);

  function update(change: Partial<AppointmentDraft>) {
    setDraft((current) => ({ ...current, ...change }));
    setErrors({});
    setFormError(null);
  }

  const service = services.find(({ id }) => id === draft.serviceId) ?? null;
  const minutes = appointment
    ? Math.round((Date.parse(appointment.endsAt) - Date.parse(appointment.startsAt)) / 60_000)
    : (service?.duration_minutes ?? null);
  const ends = minutes === null ? null : endClock(draft.time, minutes);
  const warnings = warningsOf(draft, minutes ?? 0, ranges, holidays);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = appointment ? parseMoveDraft(draft, appointment.id) : parseDraft(draft);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setFailedAttempts((count) => count + 1);
      return;
    }
    setErrors({});
    startSaving(async () => {
      const result: AppointmentResult = appointment
        ? await moveAppointment(parsed.data)
        : await createAppointment(parsed.data);
      if (result.ok) {
        onSaved(parsed.data.day);
      } else {
        setFormError(result.error);
      }
    });
  }

  function cancelAppointment() {
    setFormError(null);
    startCancelling(async () => {
      const result = await onCancelAppointment();
      if (!result.ok) {
        setFormError(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4"
    >
      <FieldGroup>
        {isMove ? null : (
          <FieldSet data-invalid={Boolean(errors.service)}>
            <FieldLegend variant="label">Servicio</FieldLegend>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cargá un servicio primero.{" "}
                <Link href="/panel/servicios" className="underline underline-offset-4">
                  Ir a Servicios
                </Link>
              </p>
            ) : (
              <ServicePicker
                services={services}
                value={draft.serviceId}
                onChange={(serviceId) => update({ serviceId })}
                invalid={Boolean(errors.service)}
                name={groupName}
              />
            )}
            <FieldError>{errors.service}</FieldError>
          </FieldSet>
        )}

        {appointment ? (
          <div className="rounded-lg border bg-muted p-3 text-sm">
            <p className="font-medium">{appointment.clientName}</p>
            <p className="text-muted-foreground">{appointment.serviceName}</p>
          </div>
        ) : (
          <>
            <Field data-invalid={Boolean(errors.client)}>
              <FieldLabel htmlFor={clientId}>Cliente</FieldLabel>
              <Input
                id={clientId}
                value={draft.clientName}
                onChange={(event) => update({ clientName: event.target.value })}
                placeholder="Lucía Pérez"
                autoComplete="off"
                aria-invalid={errors.client ? true : undefined}
              />
              <FieldError>{errors.client}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor={phoneId}>Teléfono (opcional)</FieldLabel>
              <Input
                id={phoneId}
                type="tel"
                inputMode="tel"
                value={draft.clientPhone}
                onChange={(event) => update({ clientPhone: event.target.value })}
                placeholder="+54 9 11 5555-1234"
                autoComplete="off"
                aria-invalid={errors.phone ? true : undefined}
              />
              <FieldError>{errors.phone}</FieldError>
            </Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={Boolean(errors.day)}>
            <FieldLabel htmlFor={dayId}>Día</FieldLabel>
            <Input
              id={dayId}
              type="date"
              value={draft.day}
              onChange={(event) => update({ day: event.target.value })}
              aria-invalid={errors.day ? true : undefined}
            />
            <FieldError>{errors.day}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.time)}>
            <FieldLabel htmlFor={timeId}>Hora</FieldLabel>
            <Input
              id={timeId}
              value={draft.time}
              onChange={(event) => update({ time: event.target.value })}
              inputMode="numeric"
              placeholder="14:45"
              maxLength={5}
              autoComplete="off"
              className="tabular-nums"
              aria-invalid={errors.time ? true : undefined}
            />
            <FieldError>{errors.time}</FieldError>
          </Field>
        </div>

        {ends ? (
          <FieldDescription>
            Termina {ends}
            {service ? ` · ${formatPrice(service.price_cents)}` : null}
          </FieldDescription>
        ) : null}

        {warnings.length > 0 ? (
          <div role="status" className="flex flex-col gap-2">
            {warnings.map(({ kind, message }) => (
              <p key={kind} className="flex items-start gap-3 rounded-lg border bg-muted p-3 text-sm font-medium">
                <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                {message}
              </p>
            ))}
          </div>
        ) : null}
      </FieldGroup>

      <div className="mt-auto flex flex-col gap-3 pt-2">
        {formError ? (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 font-medium"
          >
            <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
            {formError}
          </p>
        ) : null}
        {isMove ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="text-destructive"
            disabled={saving || cancelling}
            aria-busy={cancelling}
            onClick={cancelAppointment}
          >
            {cancelling ? <Spinner aria-hidden /> : null}
            Cancelar turno
          </Button>
        ) : null}
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={saving || (!isMove && services.length === 0)}
            aria-busy={saving}
          >
            {saving ? <Spinner aria-hidden /> : null}
            {saving ? "Guardando…" : isMove ? "Mover turno" : "Guardar turno"}
          </Button>
        </div>
      </div>
    </form>
  );
}
