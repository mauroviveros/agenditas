"use client";

import { useTransition } from "react";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { CurrentUser } from "@/lib/session";
import { signOut } from "@/app/auth/actions";

// La cuenta de quien entró, con su menú (por ahora solo "Salir").
export function NavUser({ user }: { user: CurrentUser }) {
  const { isMobile } = useSidebar();
  // Sin <form>: el menú se cierra y desmonta al hacer clic, y un form desmontado no se envía bien.
  const [isSigningOut, startSigningOut] = useTransition();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <UserSummary user={user} />

            <ChevronsUpDownIcon className="ml-auto size-4" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm text-foreground">
                  <UserSummary user={user} />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onClick={() => startSigningOut(() => signOut())}
            >
              <LogOutIcon aria-hidden />
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserSummary({ user: { name, email, avatarUrl } }: { user: CurrentUser }) {
  return (
    <>
      <Avatar className="size-8 rounded-md after:rounded-md">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="rounded-md">
          {name.trim().charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </span>
    </>
  );
}