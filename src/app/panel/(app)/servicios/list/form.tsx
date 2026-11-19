"use client";

import { CircleAlertIcon } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import type { Service } from "@/lib/services/queries";
import { DURATION_MAX, DURATION_MIN, DURATION_STEP, formatDuration } from "@/lib/services/schema";
import { saveService } from "../actions";
import {
  DURATION_PRESETS,
  type DraftErrors,
  type ServiceDraft,
  draftFrom,
  parseDraft,
} from "./draft";

const CHIP =
  "flex h-11 cursor-pointer items-center justify-center rounded-lg border border-input px-2 text-sm tabular-nums transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary peer-checked:font-medium peer-checked:text-primary-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 md:h-9";

interface ServiceFormProps {
  /** El servicio que se edita; sin él, el formulario crea uno nuevo. */
  service: Service | null;
  onSaved: () => void;
  onCancel: () => void;
  onDelete: (service: Service) => void;
}

// Nombre, duración y precio de un servicio. Lo escrito se valida con las reglas del esquema
// antes de enviar; lo que rechaza la base vuelve como un aviso arriba de los botones.
export function ServiceForm({ service, onSaved, onCancel, onDelete }: ServiceFormProps) {
  const [draft, setDraft] = useState<ServiceDraft>(() => draftFrom(service ?? undefined));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameId = useId();
  const minutesId = useId();
  const priceId = useId();
  const groupName = useId();

  function update(change: Partial<ServiceDraft>) {
    setDraft((current) => ({ ...current, ...change }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = parseDraft(draft, service?.id);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveService(parsed.data);
      if (result.ok) {
        onSaved();
      } else {
        setFormError(result.error);
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={nameId}>Nombre</FieldLabel>
          <Input
            id={nameId}
            value={draft.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="Corte de pelo"
            autoComplete="off"
            className="h-11 md:h-8"
            aria-invalid={errors.name ? true : undefined}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>

        <FieldSet data-invalid={Boolean(errors.duration)}>
          <FieldLegend variant="label">Duración</FieldLegend>
          <div className="grid grid-cols-3 gap-2">
            {DURATION_PRESETS.map((minutes) => (
              <label key={minutes}>
                <input
                  type="radio"
                  name={groupName}
                  className="peer sr-only"
                  checked={draft.preset === minutes}
                  onChange={() => update({ preset: minutes })}
                />
                <span className={CHIP}>{formatDuration(minutes)}</span>
              </label>
            ))}
            <label>
              <input
                type="radio"
                name={groupName}
                className="peer sr-only"
                checked={draft.preset === "other"}
                onChange={() => update({ preset: "other" })}
              />
              <span className={CHIP}>Otra…</span>
            </label>
          </div>
          {draft.preset === "other" ? (
            <Field data-invalid={Boolean(errors.duration)}>
              <FieldLabel htmlFor={minutesId} className="sr-only">
                Minutos
              </FieldLabel>
              <InputGroup className="h-11 md:h-8">
                <InputGroupInput
                  id={minutesId}
                  value={draft.otherMinutes}
                  onChange={(event) => update({ otherMinutes: event.target.value })}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={errors.duration ? true : undefined}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>min</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                De {DURATION_MIN} a {DURATION_MAX} minutos, de a {DURATION_STEP}.
              </FieldDescription>
            </Field>
          ) : null}
          <FieldError>{errors.duration}</FieldError>
        </FieldSet>

        <Field data-invalid={Boolean(errors.price)}>
          <FieldLabel htmlFor={priceId}>Precio</FieldLabel>
          <InputGroup className="h-11 md:h-8">
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={priceId}
              value={draft.price}
              onChange={(event) => update({ price: event.target.value })}
              inputMode="decimal"
              autoComplete="off"
              className="tabular-nums"
              aria-invalid={errors.price ? true : undefined}
            />
          </InputGroup>
          <FieldDescription>En pesos. Para los centavos, usá coma: 1500,50.</FieldDescription>
          <FieldError>{errors.price}</FieldError>
        </Field>
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
        <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
          {service ? (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-11 md:h-9"
              disabled={pending}
              onClick={() => onDelete(service)}
            >
              Borrar servicio
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 md:flex-row">
            <Button type="button" variant="outline" size="lg" className="h-11 md:h-9" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" className="h-11 md:h-9" disabled={pending} aria-busy={pending}>
              {pending ? <Spinner aria-hidden /> : null}
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
