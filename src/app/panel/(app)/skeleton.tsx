import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Lo que se ve mientras llegan la sesión y el negocio. Repite la estructura del panel
// (sidebar, encabezado y contenido) con las mismas medidas, para que al llegar los datos
// no se mueva nada.
export function PanelSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarRow />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <Skeleton className="h-11 md:h-8" />
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <Skeleton className="h-[4.25rem] group-data-[collapsible=icon]:hidden" />
          <SidebarRow />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-card">
        <header className="flex h-14 items-center border-b px-1.5 md:px-4">
          <Skeleton className="size-11 md:size-8" />
        </header>

        <main className="px-5 py-8 md:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <Skeleton className="h-9 w-2/3 md:h-11" />
            <Skeleton className="h-28" />
          </div>
        </main>

        <p role="status" className="sr-only">
          Cargando tu panel
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Fila de 48 px con un cuadrado y dos líneas: el negocio arriba, la cuenta abajo.
function SidebarRow() {
  return (
    <div className="flex h-12 items-center gap-2 p-2 group-data-[collapsible=icon]:p-0">
      <Skeleton className="size-8 shrink-0" />
      <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
