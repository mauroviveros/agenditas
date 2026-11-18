import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getMyBusiness } from "@/lib/business/queries";
import { getCurrentUser } from "@/lib/user";
import { FooterSlot, HeaderSlot, PanelSlotsProvider } from "./slots";
import { PanelSkeleton } from "./skeleton";

// Marco del panel: sidebar que se achica a íconos; en celu se abre como cajón con el botón.
// Cada rebanada suma su destino acá: hoy solo existe Inicio.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

// Guardas: sin sesión va a /login; con sesión pero sin negocio, a crearlo.
async function Shell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await getMyBusiness();
  if (!business) redirect("/panel/nuevo-negocio");

  return (
    <PanelSlotsProvider>
      <SidebarProvider>
        <AppSidebar
          businessName={business.name}
          businessSlug={business.slug}
          user={user}
        />

        <SidebarInset className="bg-card">
          <header className="flex h-14 items-center border-b px-1.5 md:px-4">
            <SidebarTrigger className="size-11 md:size-8" aria-label="Mostrar u ocultar el menú" />
            <HeaderSlot className="flex min-w-0 flex-1 items-center gap-2 px-2" />
          </header>

          <main data-slot="panel-content" className="flex-1 px-5 py-8 md:px-10">
            {children}
          </main>

          {/* Acciones de la pantalla (guardar, descartar): se muestra solo si una pantalla pone algo con PanelFooter. */}
          <FooterSlot className="sticky bottom-0 z-10 border-t border-border bg-card px-5 py-3 empty:hidden md:px-10" />
        </SidebarInset>
      </SidebarProvider>
    </PanelSlotsProvider>
  );
}
