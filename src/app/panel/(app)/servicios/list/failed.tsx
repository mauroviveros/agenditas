"use client";

import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// El aviso de error de DESIGN.md: texto con ícono, nunca solo color, y cómo reintentar.
export function ServicesFailed() {
  const router = useRouter();
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
    >
      <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
      <p className="flex-1 font-medium">No pudimos leer tus servicios. Probá de nuevo.</p>
      <Button variant="outline" size="sm" className="h-11 md:h-7" onClick={() => router.refresh()}>
        Probá de nuevo
      </Button>
    </div>
  );
}
