import type { Service } from "@/lib/services/queries";
import {
  type ServiceInput,
  parsePesos,
  pesosInputValue,
  serviceSchema,
} from "@/lib/services/schema";

// Las duraciones que se eligen con un toque; cualquier otra va por «Otra».
export const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 150, 180] as const;

// Lo que hay escrito en el formulario, tal cual: texto en el nombre, la chip elegida (o
// «Otra») y el precio como lo tipea el solista.
export interface ServiceDraft {
  name: string;
  preset: number | "other" | null;
  otherMinutes: string;
  price: string;
}

export type DraftField = "name" | "duration" | "price";
export type DraftErrors = Partial<Record<DraftField, string>>;
export type ParsedDraft =
  | { ok: true; data: ServiceInput }
  | { ok: false; errors: DraftErrors };

const PRICE_FORMAT_ERROR = "Poné el precio así: 1500 o 1.500,50.";

// Qué campo del formulario es cada clave del esquema.
const FIELD_OF_KEY: Record<string, DraftField> = {
  name: "name",
  duration_minutes: "duration",
  price_cents: "price",
};

// El borrador con el que abre el formulario: vacío para un servicio nuevo, o con los datos
// del que se edita.
export function draftFrom(service?: Service): ServiceDraft {
  if (!service) {
    return { name: "", preset: null, otherMinutes: "", price: "" };
  }
  const isPreset = DURATION_PRESETS.some((minutes) => minutes === service.duration_minutes);
  return {
    name: service.name,
    preset: isPreset ? service.duration_minutes : "other",
    otherMinutes: isPreset ? "" : String(service.duration_minutes),
    price: pesosInputValue(service.price_cents),
  };
}

// De lo escrito a lo que se manda a guardar, con un aviso por cada campo que falla. Las
// reglas son las del esquema; acá solo se traduce el texto del formulario a números.
export function parseDraft(draft: ServiceDraft, id?: string): ParsedDraft {
  const errors: DraftErrors = {};

  let minutes: number | undefined;
  if (draft.preset === null) {
    errors.duration = "Elegí cuánto dura.";
  } else if (draft.preset !== "other") {
    minutes = draft.preset;
  } else if (draft.otherMinutes.trim() === "") {
    errors.duration = "Poné cuántos minutos dura.";
  } else {
    minutes = Number(draft.otherMinutes);
  }

  const price = parsePesos(draft.price);
  if (price === null) {
    errors.price = PRICE_FORMAT_ERROR;
  }

  const parsed = serviceSchema.safeParse({
    id,
    name: draft.name,
    duration_minutes: minutes,
    price_cents: price,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = FIELD_OF_KEY[String(issue.path[0])];
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  if (!parsed.success || Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: parsed.data };
}
