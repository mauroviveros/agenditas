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

      <SidebarInset className="bg-card">
        <header className="flex h-14 items-center border-b px-1.5 md:px-4">
          <SidebarTrigger className="size-11 md:size-8" aria-label="Mostrar u ocultar el menú" />
        </header>

        <main className="px-5 py-8 md:px-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}