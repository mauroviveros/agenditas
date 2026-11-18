import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Misma estructura y medidas que AppSidebar: negocio arriba; el menú; y abajo el link de
// reservas y la cuenta. Si cambia AppSidebar, se actualiza acá.
export function SidebarSkeleton() {
  return (
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
