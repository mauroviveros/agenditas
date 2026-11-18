"use client";

import { Button } from "@/components/ui/button";

// Si falla la lectura de la sesión o del negocio (un corte de Supabase, por ejemplo),
// se muestra esto en vez de la pantalla genérica de Next.
export default function PanelError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
      <h1 className="font-heading text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-balance">
        Algo salió mal de nuestro lado
      </h1>
      <p className="mt-2 text-muted-foreground">
        No pudimos cargar tu panel. Probá de nuevo; si sigue igual, volvé en un rato.
      </p>
      <Button type="button" size="xl" className="mt-8 w-full" onClick={() => retry()}>
        Probar de nuevo
      </Button>
    </main>
  );
}
