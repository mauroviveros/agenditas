"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findScreen } from "@/lib/panel/screens";
import { ActionsSlot } from "./panel-slots";

// Encabezado del panel: título y bajada salen del registro de pantallas según la ruta, así
// que llegan en el primer HTML (un componente de cliente también se renderiza en el servidor)
// y no se vuelven a montar al navegar. Solo las acciones entran después, por portal.
export function PanelHeader({ businessName }: { businessName: string }) {
  const screen = findScreen(usePathname());
  const title = screen?.titleIsBusinessName ? businessName : screen?.label;

  return (
    <header className="flex h-14 items-center border-b px-1.5 md:px-4">
      <SidebarTrigger className="size-11 md:size-8" aria-label="Mostrar u ocultar el menú" />
      <Separator orientation="vertical" className="mx-1 data-vertical:h-5 data-vertical:self-center md:mx-2" />
      <div className="flex min-w-0 flex-1 flex-col px-2">
        {title ? <h1 className="truncate font-heading text-base font-medium">{title}</h1> : null}
        {screen?.subtitle ? (
          <p className="hidden truncate text-sm text-muted-foreground md:block">{screen.subtitle}</p>
        ) : null}
      </div>
      <ActionsSlot className="flex shrink-0 items-center gap-2 px-2 empty:hidden" />
    </header>
  );
}
