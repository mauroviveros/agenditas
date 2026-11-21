"use client";

import type { HolidayRow } from "@/lib/holidays/parse";
import type { HourRange } from "@/lib/hours/schema";
import type { AppointmentResult } from "../actions";
import { AgendaPanel } from "./panel";
import type { Service } from "@/lib/services/queries";
import type { AppointmentDraft } from "./draft";
import { AppointmentForm } from "./form";
import type { AppointmentItem } from "./timeline";

interface AppointmentEditorProps {
  open: boolean;
  /** El turno que se mueve; sin él, se agenda uno nuevo. */
  appointment: AppointmentItem | null;
  initial: AppointmentDraft;
  services: Service[];
  ranges: HourRange[];
  holidays: HolidayRow[];
  onOpenChange: (open: boolean) => void;
  onSaved: (day: string) => void;
  onCancelAppointment: () => Promise<AppointmentResult>;
}

// El formulario del turno, en el panel de la agenda.
export function AppointmentEditor({
  open,
  appointment,
  initial,
  services,
  ranges,
  holidays,
  onOpenChange,
  onSaved,
  onCancelAppointment,
}: AppointmentEditorProps) {
  const title = appointment ? "Mover turno" : "Nuevo turno";
  const description = appointment
    ? "Elegí el día y la hora nuevos."
    : "Elegí el servicio, poné el nombre y la hora.";

  const form = (
    <AppointmentForm
      appointment={appointment}
      initial={initial}
      services={services}
      ranges={ranges}
      holidays={holidays}
      onSaved={onSaved}
      onCancelAppointment={onCancelAppointment}
      onCancel={() => onOpenChange(false)}
    />
  );

  return (
    <AgendaPanel open={open} onOpenChange={onOpenChange} title={title} description={description}>
      {form}
    </AgendaPanel>
  );
}
