import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "./header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser, getMyBusiness } from "@/lib/session";
import { FooterSlot, PanelSlotsProvider } from "./slots";
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
  if (!user) {
    redirect("/login");
  }
  const business = await getMyBusiness();
  if (!business) {
    redirect("/panel/nuevo-negocio");
  }

  return (
    <PanelSlotsProvider>
      <SidebarProvider>
        <AppSidebar
          businessName={business.name}
          businessSlug={business.slug}
          user={user}
        />

        <SidebarInset className="bg-card">
          <AppHeader />

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
