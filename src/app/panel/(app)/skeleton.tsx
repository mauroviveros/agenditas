import { AppHeaderSkeleton } from "./header";
import { SidebarSkeleton } from "@/components/sidebar/skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Lo que se ve mientras llegan la sesión y el negocio: solo el marco del panel (sidebar y
// encabezado). El contenido queda vacío porque acá no se sabe qué ruta se está cargando;
// cada pantalla pone el suyo en su loading.tsx. SidebarInset ya es el <main> de la página.
export function PanelSkeleton() {
  return (
    <SidebarProvider>
      <SidebarSkeleton />

      <SidebarInset className="bg-card">
        <AppHeaderSkeleton />
        <div data-slot="panel-content" className="px-5 py-8 md:px-10" />

        <p role="status" className="sr-only">
          Cargando tu panel
        </p>
      </SidebarInset>
    </SidebarProvider>
  );
}
