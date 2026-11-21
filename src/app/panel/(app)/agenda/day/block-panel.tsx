"use client";

import { CircleAlertIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatTime } from "@/lib/time";
import type { AppointmentResult } from "../actions";
import { AgendaPanel } from "./panel";
import type { BlockItem } from "./timeline";

interface BlockPanelProps {
  block: BlockItem | null;
  /** Si el bloqueo está en curso: ahí el botón dice «Ya volví». */
  inProgress: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cancela el bloqueo; si falla, el aviso se muestra acá. */
  onRemove: (block: BlockItem) => Promise<AppointmentResult>;
}

// Un bloqueo se libera cancelándolo: vuelve el horario completo, no queda registro de la salida.
// shortcut: no se puede acortar hasta «ahora»; hace falta una RPC que cambie la hora de fin.
export function BlockPanel({ block, inProgress, open, onOpenChange, onRemove }: BlockPanelProps) {
  const [removing, startRemoving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!block) {
      return;
    }
    setError(null);
    startRemoving(async () => {
      const result = await onRemove(block);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <AgendaPanel
      open={open}
      onOpenChange={onOpenChange}
      title="Bloqueado"
      description={
        block
          ? `De ${formatTime(block.startsAt)} a ${formatTime(block.endsAt)} no recibís turnos.`
          : ""
      }
    >
      <div className="flex flex-col gap-3 px-4 pb-4">
        {error ? (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 font-medium"
          >
            <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
            {error}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button type="button" size="lg" disabled={removing} aria-busy={removing} onClick={remove}>
            {removing ? <Spinner aria-hidden /> : null}
            {inProgress ? "Ya volví" : "Quitar bloqueo"}
          </Button>
        </div>
      </div>
    </AgendaPanel>
  );
}
