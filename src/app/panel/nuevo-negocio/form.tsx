"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { type ReactNode, useActionState, useEffect, useId, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  businessSchema,
  PUBLIC_LINK_PATH as LINK_PREFIX,
  SLUG_MAX,
  slugBaseForSuffix,
  slugify,
} from "@/lib/business/schema";
import { checkSlugAvailability, createBusiness, type CreateBusinessState } from "./actions";

const INITIAL_STATE: CreateBusinessState = {};
// Espera después de la última tecla antes de preguntar si el link está libre.
const CHECK_DELAY_MS = 400;

type Availability = "idle" | "checking" | "available" | "taken" | "unknown";

// El link sale del nombre. Se ofrece cambiarlo a mano si está ocupado o si el servidor
// lo rechazó (por ejemplo, un nombre que da un link muy corto).
export function BusinessForm({ heading }: { heading: ReactNode }) {
  const [state, formAction] = useActionState(createBusiness, INITIAL_STATE);
  const [name, setName] = useState("");
  // null = el link es el del nombre. Al cambiarlo, solo se le puede sumar algo al final
  // (la zona): la base sigue siendo el nombre, no se cambia por otro.
  const [slugSuffix, setSlugSuffix] = useState<string | null>(null);
  // El link con el que se envió por última vez: un error del servidor solo vale para ese.
  const [submittedSlug, setSubmittedSlug] = useState<string | null>(null);
  const nameId = useId();
  const slugId = useId();
  const prefixId = useId();
  const slugInputRef = useRef<HTMLInputElement>(null);
  const isEditingSlug = slugSuffix !== null;

  // Al abrir "Cambiar link", el foco va directo al agregado.
  useEffect(() => {
    if (isEditingSlug) {
      slugInputRef.current?.focus();
    }
  }, [isEditingSlug]);

  const nameSlug = slugify(name);
  // Al agregar algo, la base se recorta para que el link siga entrando en el máximo.
  const slugBase = isEditingSlug ? slugBaseForSuffix(nameSlug) : nameSlug;
  const slug = [slugBase, slugSuffix].filter(Boolean).join("-");
  const availability = useSlugAvailability(slug);
  const nameError = state.fieldErrors?.name;
  const slugError = submittedSlug === slug ? state.fieldErrors?.slug : undefined;
  const canChangeSlug = availability === "taken" || Boolean(slugError);

  function submit(formData: FormData) {
    setSubmittedSlug(slug);
    formAction(formData);
  }

  return (
    <div className="flex flex-1 flex-col md:mt-12 md:grid md:flex-none md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-center md:gap-16">
      <div className="flex flex-1 flex-col">
        {heading}
        <form action={submit} noValidate className="flex flex-1 flex-col">
          <FieldGroup>
            <Field data-invalid={Boolean(nameError)}>
              <FieldLabel htmlFor={nameId}>Nombre del negocio</FieldLabel>
              <Input
                id={nameId}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Barbería Tito"
                autoComplete="organization"
                aria-invalid={nameError ? true : undefined}
              />
              <FieldError>{nameError}</FieldError>
            </Field>

            <input type="hidden" name="slug" value={slug} />
            {slugSuffix === null ? (
              <div>
                <p className="text-sm text-muted-foreground">Tu link</p>
                <p className="font-semibold break-all">
                  {LINK_PREFIX}
                  {slug || "tu-negocio"}
                </p>
                <SlugStatus availability={availability} />
                {canChangeSlug ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => setSlugSuffix("")}
                  >
                    Cambiar link
                  </Button>
                ) : null}
                <FieldError>{slugError}</FieldError>
              </div>
            ) : (
              <Field data-invalid={Boolean(slugError)}>
                <FieldLabel htmlFor={slugId}>Tu link</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="block-start">
                    <InputGroupText id={prefixId} className="break-all">
                      {LINK_PREFIX}
                      {slugBase ? `${slugBase}-` : ""}
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={slugInputRef}
                    id={slugId}
                    value={slugSuffix}
                    onChange={(event) => setSlugSuffix(event.target.value)}
                    maxLength={SLUG_MAX - (slugBase ? slugBase.length + 1 : 0)}
                    placeholder="palermo"
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={prefixId}
                    aria-invalid={slugError ? true : undefined}
                  />
                </InputGroup>
                <FieldDescription>Sumale tu barrio o ciudad, por ejemplo palermo.</FieldDescription>
                <SlugStatus availability={availability} />
                <FieldError>{slugError}</FieldError>
              </Field>
            )}
          </FieldGroup>

          <div className="mt-auto pt-10 md:mt-10 md:pt-0">
            {state.formError ? (
              <p
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 font-medium"
              >
                <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
                {state.formError}
              </p>
            ) : null}
            <SubmitButton pendingLabel="Creando tu negocio…">Crear mi negocio</SubmitButton>
          </div>
        </form>
      </div>
      <PagePreview name={name} slug={slug} taken={availability === "taken"} />
    </div>
  );
}

// Solo en escritorio: la página del negocio se va armando mientras escribe.
// Repite lo que ya está en el formulario, por eso queda oculta para lectores de pantalla.
function PagePreview({ name, slug, taken }: { name: string; slug: string; taken: boolean }) {
  return (
    <aside aria-hidden="true" className="hidden flex-col gap-6 rounded-xl border bg-card p-10 md:flex">
      <p className="text-sm font-semibold text-muted-foreground">
        Así te van a encontrar tus clientes
      </p>
      <p
        className={`w-fit max-w-full rounded-full bg-background px-4 py-2 text-sm font-semibold break-all ${
          taken ? "text-muted-foreground line-through" : ""
        }`}
      >
        {LINK_PREFIX}
        {slug || "tu-negocio"}
      </p>
      <p className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance break-words">
        {name.trim() || "Tu negocio"}
      </p>
      <p className="text-muted-foreground">
        Acá eligen un horario y reservan solos, sin escribirte por WhatsApp.
      </p>
    </aside>
  );
}

const STATUS_TEXT: Record<Availability, string | null> = {
  idle: null,
  checking: "Revisando…",
  available: "Disponible",
  taken: "Ya lo usa otro negocio",
  unknown: null,
};

const STATUS_ICON: Record<Availability, ReactNode> = {
  idle: null,
  checking: <Spinner aria-hidden className="text-muted-foreground" />,
  available: <CircleCheckIcon aria-hidden className="size-4 text-primary" />,
  taken: <CircleAlertIcon aria-hidden className="size-4" />,
  unknown: null,
};

function SlugStatus({ availability }: { availability: Availability }) {
  return (
    <p aria-live="polite" className="mt-1 flex min-h-5 items-center gap-1.5 text-sm font-semibold">
      {STATUS_ICON[availability]}
      {STATUS_TEXT[availability]}
    </p>
  );
}

// Pregunta si el link está libre un rato después de la última tecla. Un link con
// formato inválido no se consulta: lo marca el servidor al enviar.
function useSlugAvailability(slug: string): Availability {
  const [result, setResult] = useState<{ slug: string; available: boolean | null } | null>(
    null,
  );
  const isValid = businessSchema.shape.slug.safeParse(slug).success;

  useEffect(() => {
    if (!isValid) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      // Si falla el pedido (sin red, error del servidor), no se afirma nada: "unknown".
      const available = await checkSlugAvailability(slug).catch(() => null);
      if (!cancelled) {
        setResult({ slug, available });
      }
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, isValid]);

  if (!isValid) {
    return "idle";
  }
  if (result?.slug !== slug) {
    return "checking";
  }
  if (result.available === null) {
    return "unknown";
  }
  return result.available ? "available" : "taken";
}
