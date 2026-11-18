import { SidebarSkeleton } from "@/components/sidebar/skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Lo que se ve mientras llegan la sesión y el negocio: solo el marco del panel (sidebar y
// encabezado). El contenido queda vacío porque acá no se sabe qué ruta se está cargando;
// cada pantalla pone el suyo en su loading.tsx. el <main> va dentro de SidebarInset.
export function PanelSkeleton() {
  return (
    <SidebarProvider>
      <SidebarSkeleton />

      <SidebarInset className="bg-card">
        <header className="flex h-14 items-center border-b px-1.5 md:px-4">
          <Skeleton className="size-11 md:size-8" />
        </header>

        <main data-slot="panel-content" className="flex-1 px-5 py-8 md:px-10" />

        <p role="status" className="sr-only">
          Cargando tu panel
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}
