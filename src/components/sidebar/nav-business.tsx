import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
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
                        {/* <span
                            aria-hidden
                            className={cn([
                                "flex aspect-square size-8 items-center justify-center",
                                "rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"    
                            ])}
                        >
                            {businessName.trim().charAt(0).toUpperCase()}
                        </span> */}
                        
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{businessName}</span>
                            <span className="truncate text-xs text-muted-foreground">Dueño</span>
                        </div>

                        <ChevronsUpDown className="ml-auto" />
                    </DropdownMenuTrigger>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}


// <SidebarMenu>
//     <SidebarMenuItem>
//         <div className="flex h-12 items-center gap-2 overflow-hidden p-2 text-sm group-data-[collapsible=icon]:p-0">
//         <span
//             aria-hidden
//             className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
//         >
//             {businessName.trim().charAt(0).toUpperCase()}
//         </span>
//         <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
//             <span className="truncate font-medium">{businessName}</span>
//             <span className="truncate text-xs text-muted-foreground">Dueño</span>
//         </span>
//         </div>
//     </SidebarMenuItem>
// </SidebarMenu>

{/* <SidebarMenu>
    <SidebarMenuItem>
    <SidebarMenuButton
        asChild
        className="data-[slot=sidebar-menu-button]:p-1.5!"
    >
        <a href="#">
        <IconInnerShadowTop className="size-5!" />
        <span className="text-base font-semibold">Acme Inc.</span>
        </a>
    </SidebarMenuButton>
    </SidebarMenuItem>
</SidebarMenu> */}