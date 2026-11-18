"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ClockIcon, HouseIcon, type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Cada rebanada suma su destino acá.
const NAV_ITEMS: readonly NavItem[] = [
  { title: "Inicio", href: "/panel", icon: HouseIcon },
  { title: "Horarios", href: "/panel/horarios", icon: ClockIcon },
];

export function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {NAV_ITEMS.map(({ title, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                isActive={isActive}
                // className="h-11 border border-transparent data-active:border-sidebar-border md:h-8"
                tooltip={title}
                render={
                  <Link href={href} aria-current={isActive ? "page" : undefined} />
                }
              >
                <Icon aria-hidden />
                <span>{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
