import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ActionsSlot } from "./panel-slots";

interface PanelPageProps {
  title: string;
  /** Bajada de una línea: dice qué es la pantalla. Se ve desde md; la ayuda de uso va en el cuerpo. */
  subtitle?: string;
  children: ReactNode;
}

// Marco de cada pantalla del panel: encabezado (título, bajada y acciones) y cuerpo. Se
// dibuja en el servidor, así que el título ya viene en el primer pintado; solo las acciones
// (que necesitan el estado de la pantalla) entran después por portal. Cada página, y su
// loading.tsx, lo usa como envoltorio.
export function PanelPage({ title, subtitle, children }: PanelPageProps) {
  return (
    <>
      <header className="flex h-14 items-center border-b px-1.5 md:px-4">
        <SidebarTrigger className="size-11 md:size-8" aria-label="Mostrar u ocultar el menú" />
        <Separator orientation="vertical" className="mx-1 data-vertical:h-5 data-vertical:self-center md:mx-2" />
        <div className="flex min-w-0 flex-1 flex-col px-2">
          <h1 className="truncate font-heading text-base font-medium">{title}</h1>
          {subtitle ? (
            <p className="hidden truncate text-sm text-muted-foreground md:block">{subtitle}</p>
          ) : null}
        </div>
        <ActionsSlot className="flex shrink-0 items-center gap-2 px-2 empty:hidden" />
      </header>

      <main data-slot="panel-content" className="flex-1 px-5 py-8 md:px-10">
        {children}
      </main>
    </>
  );
}
