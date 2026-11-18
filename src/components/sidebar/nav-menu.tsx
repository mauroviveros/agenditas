"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HouseIcon, LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Cada rebanada suma su destino acá.
const NAV_ITEMS: readonly NavItem[] = [
  { title: "Inicio", href: "/panel", icon: HouseIcon },
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
