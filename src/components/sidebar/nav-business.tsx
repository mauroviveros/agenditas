import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export function NavBusiness({ businessName }: { businessName: string }) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<SidebarMenuButton size="lg" />}
                    >   
                        <Avatar className="size-8 rounded-md">
                            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground rounded-md">
                                {businessName.trim().charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{businessName}</span>
                            <span className="truncate text-xs text-muted-foreground">Dueño</span>
                        </div>

                        {/* <ChevronsUpDown className="ml-auto" /> */}
                    </DropdownMenuTrigger>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}