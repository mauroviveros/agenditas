"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { findScreen, SCREENS } from "@/lib/panel/screens";

export function NavMenu() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  // El mismo criterio que el encabezado: una ruta anidada marca la pantalla de la que cuelga.
  const activeHref = findScreen(pathname)?.href;

  return (
    <SidebarGroup>
      <SidebarMenu>
        {SCREENS.map(({ label, href, icon: Icon }) => {
          const isActive = activeHref === href;

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={label}
                render={
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    // En celu el menú es un cajón: al elegir una pantalla se cierra.
                    onClick={() => setOpenMobile(false)}
                  />
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
