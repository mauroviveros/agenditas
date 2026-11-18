import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSlot } from "./slots";

// Altura y márgenes compartidos con el esqueleto, para que al cargar no se mueva nada.
const HEADER_CLASS = "flex h-14 items-center border-b px-1.5 md:px-4";
const TRIGGER_SIZE = "size-11 md:size-8";

// Barra de arriba: el botón que abre o achica el sidebar (en celu es un cajón) y, al lado,
// lo que cada pantalla ponga con PanelHeader.
export function AppHeader() {
  return (
    <header className={HEADER_CLASS}>
      <SidebarTrigger className={TRIGGER_SIZE} aria-label="Mostrar u ocultar el menú" />
      <HeaderSlot className="flex min-w-0 flex-1 items-center gap-2 px-2" />
    </header>
  );
}

export function AppHeaderSkeleton() {
  return (
    <header className={HEADER_CLASS}>
      <Skeleton className={TRIGGER_SIZE} />
    </header>
  );
}
