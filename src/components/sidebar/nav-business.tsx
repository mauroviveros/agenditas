import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

// El negocio de quien entró. Lleva al inicio del panel; si algún día hay más de un
// negocio por cuenta, acá va el selector.
export function NavBusiness({ businessName }: { businessName: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<Link href="/panel" />}>
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              {businessName.trim().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{businessName}</span>
            <span className="truncate text-xs text-muted-foreground">Dueño</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
