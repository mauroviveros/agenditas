import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser, getMyBusiness } from "@/lib/session";
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
    <SidebarProvider>
      <AppSidebar businessName={business.name} businessSlug={business.slug} user={user} />

      <SidebarInset className="bg-card">
        <AppHeader />

        <div data-slot="panel-content" className="px-5 py-8 md:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
