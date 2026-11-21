"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { HolidayRow } from "@/lib/holidays/parse";
import type { HourRange } from "@/lib/hours/schema";
import type { AppointmentResult } from "../actions";
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

// El formulario del turno: un Sheet a la derecha en escritorio y un Drawer que sube desde abajo en
// celu, donde se alcanza con el pulgar y se cierra arrastrando.
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
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {form}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {form}
      </SheetContent>
    </Sheet>
  );
}
