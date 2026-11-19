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
import type { Service } from "@/lib/services/queries";
import { formatDuration, formatPrice } from "@/lib/services/schema";
import type { ServiceResult } from "../actions";
import { ServiceForm } from "./form";

interface ServiceEditorProps {
  open: boolean;
  /** El servicio que se edita; sin él, se crea uno nuevo. */
  service: Service | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (service: Service) => Promise<ServiceResult>;
}

// El formulario del servicio: un Sheet a la derecha en escritorio y un Drawer que sube desde
// abajo en celu, donde se alcanza con el pulgar y se cierra arrastrando.
export function ServiceEditor({ open, service, onOpenChange, onDelete }: ServiceEditorProps) {
  const isMobile = useIsMobile();
  const title = service ? "Editar servicio" : "Nuevo servicio";
  // El nombre ya está en el campo; lo que se viene a mirar es cuánto dura y cuánto cuesta.
  const description = service
    ? `${formatDuration(service.duration_minutes)} · ${formatPrice(service.price_cents)}`
    : "Cargá cómo se llama, cuánto dura y cuánto cuesta.";

  const form = (
    <ServiceForm
      service={service}
      onSaved={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
      onDelete={onDelete}
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
