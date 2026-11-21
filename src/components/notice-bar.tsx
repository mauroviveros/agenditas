"use client";

import { CircleAlertIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const UNDO_WINDOW_MS = 6000;

interface NoticeBarProps {
  message: ReactNode;
  /** Con `onUndo` es un aviso con Deshacer que se va solo; sin él, un error que se cierra a mano. */
  onUndo?: () => void;
  onDismiss: () => void;
}

// Aviso bajo el encabezado tras archivar o cancelar algo: dice qué pasó y deja deshacerlo unos
// segundos. El tiempo corre solo mientras nadie apunta ni enfoca el aviso: quien lo lee con calma
// o con un lector de pantalla no lo ve desaparecer.
export function NoticeBar({ message, onUndo, onDismiss }: NoticeBarProps) {
  const [paused, setPaused] = useState(false);
  const canUndo = onUndo !== undefined;

  useEffect(() => {
    if (!canUndo || paused) {
      return;
    }
    const timer = setTimeout(onDismiss, UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [canUndo, paused, onDismiss]);

  if (!canUndo) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
      >
        <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="flex-1 font-medium">{message}</p>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Cerrar
        </Button>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg border bg-muted p-4"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="flex-1">{message}</p>
      <Button variant="outline" size="sm" onClick={onUndo}>
        Deshacer
      </Button>
    </div>
  );
}
