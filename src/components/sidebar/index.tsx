import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import type { CurrentUser } from "@/lib/session";
import { NavMenu } from "./nav-menu";
import { NavUser } from "./nav-user";
import { NavBusiness } from "./nav-business";
import { NavPublicLink } from "./nav-public-link";

export function AppSidebar({
  businessName,
  businessSlug,
  user,
}: {
  businessName: string;
  businessSlug: string;
  user: CurrentUser;
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <NavBusiness businessName={businessName} />
      </SidebarHeader>

      <SidebarContent>
        <NavMenu />
      </SidebarContent>

      <SidebarFooter>
        <NavPublicLink slug={businessSlug} />
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail aria-label="Mostrar u ocultar el menú" title="Mostrar u ocultar el menú" />
    </Sidebar>
  );
}
