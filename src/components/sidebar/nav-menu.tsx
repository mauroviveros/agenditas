"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SCREENS } from "@/lib/panel/screens";

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {SCREENS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                isActive={isActive}
                // className="h-11 border border-transparent data-active:border-sidebar-border md:h-8"
                tooltip={label}
                render={
                  <Link href={href} aria-current={isActive ? "page" : undefined} />
                }
              >
                <Icon aria-hidden />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
