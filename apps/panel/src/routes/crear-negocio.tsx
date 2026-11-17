import { slugify } from "@agenditas/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { businessQuery, createBusiness, slugAvailable } from "../lib/business";
import { businessErrorMessage } from "../lib/errors";
import { requireSessionWithoutBusiness } from "../lib/guards";
import { findFreeSlug } from "../lib/slug-search";
import { useDebounced } from "../lib/use-debounced";

const CATEGORIES = ["Barbería", "Estética", "Salud", "Tatuajes", "Otro"];
const PUBLIC_PREFIX = "agenditas.app/s/";
const SLUG_DEBOUNCE_MS = 300;
const MIN_SLUG_LENGTH = 3;

export const Route = createFileRoute("/crear-negocio")({
  beforeLoad: ({ context }) =>
    requireSessionWithoutBusiness(context.queryClient),
  component: CreateBusinessPage,
});

function isAlreadyCreated(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    error.message === "business_already_exists"
  );
}

function CreateBusinessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customSlug, setCustomSlug] = useState<string | null>(null);

  // El slug se arma del nombre hasta que la persona lo edita a mano.
  const slug = customSlug ?? slugify(name);
  const checkedSlug = useDebounced(slug, SLUG_DEBOUNCE_MS);
  const settled = checkedSlug === slug;
  const canCheck = settled && slug.length >= MIN_SLUG_LENGTH;

  const availability = useQuery({
    queryKey: ["slug-available", checkedSlug],
    queryFn: () => slugAvailable(checkedSlug),
    enabled: canCheck,
    staleTime: 0,
  });
  const taken = canCheck && availability.data === false;
  const suggestion = useQuery({
    queryKey: ["slug-suggestion", checkedSlug],
    queryFn: () => findFreeSlug(checkedSlug, slugAvailable),
    enabled: taken,
  });

  // Se descarta el `null` cacheado: si no, la guarda del panel lo lee y vuelve acá.
  async function goToPanel() {
    queryClient.removeQueries({ queryKey: businessQuery.queryKey });
    await navigate({ to: "/", replace: true });
  }

  const create = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      await goToPanel();
    },
    onError: async (error) => {
      if (isAlreadyCreated(error)) await goToPanel();
    },
  });

  const available = canCheck && availability.data === true;
  const ready = name.trim() !== "" && category !== "" && available;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (ready) create.mutate({ name: name.trim(), category, slug });
  }

  const slugHint = (() => {
    if (slug.length < MIN_SLUG_LENGTH)
      return "Usá de 3 a 40 letras, números o guiones.";
    if (!canCheck || availability.isPending) return "Mirando si está libre…";
    if (available)
      return <span className="font-semibold text-primary">✓ Disponible</span>;
    return undefined;
  })();

  return (
    <AuthLayout>
      <h1 className="-mt-6 text-[28px] font-semibold leading-[34px] tracking-tight">
        Creá tu agenda
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Es lo que van a ver tus clientes.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <Field
          label="Nombre del negocio"
          name="name"
          autoComplete="organization"
          maxLength={80}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold">Rubro</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="category"
                  value={option}
                  checked={category === option}
                  onChange={() => setCategory(option)}
                  className="peer sr-only"
                />
                <span className="flex h-11 cursor-pointer items-center rounded-full border border-border-strong bg-surface px-4 font-medium peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-surface peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <Field
            label="Tu dirección"
            name="slug"
            prefix={PUBLIC_PREFIX}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={40}
            value={slug}
            onChange={(event) => setCustomSlug(slugify(event.target.value))}
            hint={slugHint}
            error={taken ? "Ese link no está disponible." : undefined}
          />
          {taken && suggestion.data ? (
            <button
              type="button"
              onClick={() => setCustomSlug(suggestion.data)}
              className="mt-2 min-h-11 font-medium text-primary underline"
            >
              Usar {suggestion.data}
            </button>
          ) : null}
        </div>
        {create.isError ? (
          <p role="alert" className="text-destructive">
            {businessErrorMessage(create.error)}
          </p>
        ) : null}
        <Button type="submit" disabled={!ready || create.isPending}>
          {create.isPending ? "Creando…" : "Crear mi agenda"}
        </Button>
      </form>
    </AuthLayout>
  );
}
