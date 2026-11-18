import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser, getMyBusiness } from "@/lib/session";

// Marco del panel: sidebar que se achica a íconos; en celu se abre como cajón con el botón.
// Cada rebanada suma su destino acá: hoy solo existe Inicio.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
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
      <AppSidebar businessName={business.name} user={user} />

      <SidebarInset className="bg-background">
        <header>
          <SidebarTrigger aria-label="Mostrar u ocultar el menú" />
        </header>

        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}