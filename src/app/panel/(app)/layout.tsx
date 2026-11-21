import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMyBusiness } from "@/lib/business/queries";
import { getCurrentUser } from "@/lib/user";
import { PanelHeader } from "./header";
import { FooterSlot, PanelSlotsProvider } from "./panel-slots";
import { PanelSkeleton } from "./skeleton";

// Marco del panel: sidebar que se achica a íconos; en celu se abre como cajón con el botón.
// Cada pantalla se suma en src/lib/panel/screens.ts: el menú y el encabezado la leen de ahí.
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
          <PanelHeader businessName={business.name} />

          <main data-slot="panel-content" className="flex-1 px-5 py-8 md:px-10">
            {children}
          </main>

          {/* Acciones de la pantalla (guardar, descartar): se muestra solo si una pantalla pone algo con PanelFooter. */}
          <FooterSlot className="sticky bottom-0 z-10 empty:hidden" />
        </SidebarInset>
      </SidebarProvider>
    </PanelSlotsProvider>
  );
}
