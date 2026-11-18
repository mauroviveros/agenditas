"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
  /** Va dentro de un círculo blanco a la izquierda (p. ej. el logo de Google). */
  icon?: ReactNode;
}

// Botón principal de un formulario: mientras la acción corre avisa con
// `pendingLabel`, muestra un spinner y no se puede tocar dos veces.
export function SubmitButton({ children, pendingLabel, icon }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const lead = icon ? (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-foreground">
      {pending ? <Spinner aria-hidden className="text-primary" /> : icon}
    </span>
  ) : pending ? (
    <Spinner aria-hidden />
  ) : null;

  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full">
      {lead}
      {pending ? pendingLabel : children}
    </Button>
  );
}
