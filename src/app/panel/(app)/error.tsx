"use client";

import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Si falla la lectura de una pantalla (un corte de Supabase, por ejemplo), el error sube hasta
// acá: el menú y el encabezado quedan y el cuerpo muestra este aviso. Es el aviso de error de
// DESIGN.md (texto con ícono, nunca solo color) con cómo reintentar. En vez de mostrar una
// pantalla vacía que invite a guardar y pisar lo real, no se muestra nada de la pantalla. El
// detalle queda en el log del servidor, que se cruza por el `digest` del error.
export default function ScreenError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
    >
      <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
      <p className="flex-1 font-medium">No pudimos cargar esta pantalla.</p>
      <Button variant="outline" size="sm" onClick={() => retry()}>
        Probá de nuevo
      </Button>
    </div>
  );
}
