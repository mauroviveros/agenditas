import {
  type AppointmentInput,
  type MoveInput,
  appointmentSchema,
  moveSchema,
} from "@/lib/appointments/schema";
import { clock } from "@/lib/appointments/summary";
import { openSpans } from "@/lib/appointments/timeline";
import { type SlotWarning, slotWarnings } from "@/lib/appointments/warnings";
import type { HolidayRow } from "@/lib/holidays/parse";
import type { HourRange } from "@/lib/hours/schema";

const MINUTES_PER_HOUR = 60;

// Lo que hay escrito en el formulario, tal cual: el servicio elegido, los textos del cliente y el
// día y la hora como los tipea el solista.
export interface AppointmentDraft {
  serviceId: string;
  clientName: string;
  clientPhone: string;
  day: string;
  time: string;
}

export type DraftField = "service" | "client" | "phone" | "day" | "time";
export type DraftErrors = Partial<Record<DraftField, string>>;
export type Parsed<T> = { ok: true; data: T } | { ok: false; errors: DraftErrors };

// Qué campo del formulario es cada clave del esquema.
const FIELD_OF_KEY: Record<string, DraftField> = {
  service_id: "service",
  client_name: "client",
  client_phone: "phone",
  day: "day",
  time: "time",
  id: "service",
};

// El primer aviso de cada campo que falla. Las reglas son las del esquema; acá solo se les pone
// el nombre del campo del formulario.
function errorsOf(issues: { path: PropertyKey[]; message: string }[]): DraftErrors {
  const errors: DraftErrors = {};
  for (const issue of issues) {
    const field = FIELD_OF_KEY[String(issue.path[0])];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function parseDraft(draft: AppointmentDraft): Parsed<AppointmentInput> {
  const parsed = appointmentSchema.safeParse({
    service_id: draft.serviceId,
    client_name: draft.clientName,
    client_phone: draft.clientPhone,
    day: draft.day,
    time: draft.time,
  });
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, errors: errorsOf(parsed.error.issues) };
}

// Mover solo cambia el día y la hora; el cliente y el servicio del turno quedan como estaban.
export function parseMoveDraft(draft: AppointmentDraft, id: string): Parsed<MoveInput> {
  const parsed = moveSchema.safeParse({ id, day: draft.day, time: draft.time });
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, errors: errorsOf(parsed.error.issues) };
}

const minutesOf = (time: string) =>
  Number(time.slice(0, 2)) * MINUTES_PER_HOUR + Number(time.slice(3));

const isValidDay = (day: string) => appointmentSchema.shape.day.safeParse(day).success;
const isValidTime = (time: string) => appointmentSchema.shape.time.safeParse(time).success;

/** A qué hora termina un turno que arranca a `time` y dura `minutes`; null si la hora no se entiende. */
export function endClock(time: string, minutes: number): string | null {
  return isValidTime(time) ? clock(minutesOf(time) + minutes) : null;
}

// Los avisos del horario elegido: feriado, almuerzo o fuera de horario. Sin un día y una hora
// válidos todavía no hay nada que avisar. No frenan el guardado.
export function warningsOf(
  draft: AppointmentDraft,
  minutes: number,
  ranges: HourRange[],
  holidays: HolidayRow[],
): SlotWarning[] {
  if (!isValidDay(draft.day) || !isValidTime(draft.time)) {
    return [];
  }
  const startMinute = minutesOf(draft.time);
  return slotWarnings({
    startMinute,
    endMinute: startMinute + minutes,
    open: openSpans(draft.day, ranges),
    holiday: holidays.find(({ date }) => date === draft.day)?.name ?? null,
  });
}
