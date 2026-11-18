import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import type { CurrentUser } from "@/lib/session";
import { NavMenu } from "./nav-menu";
import { NavUser } from "./nav-user";
import { NavBusiness } from "./nav-business";

export function AppSidebar({
  businessName,
  user,
}: {
  businessName: string;
  user: CurrentUser;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavBusiness businessName={businessName} />
      </SidebarHeader>

      <SidebarContent>
        <NavMenu />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail  />
    </Sidebar>
  );
}
