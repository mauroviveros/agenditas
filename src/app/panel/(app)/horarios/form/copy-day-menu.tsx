"use client";

import type { ReactElement, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALL_DAYS, WORKWEEK } from "./week";

interface CopyDayMenuProps {
  dayName: string | undefined;
  onCopy: (to: readonly number[]) => void;
  /** El botón que abre el menú (se le pasa como `render`). */
  trigger: ReactElement;
  children: ReactNode;
}

// Menú para copiar el horario de un día a otros días.
export function CopyDayMenu({
  dayName,
  onCopy,
  trigger,
  children,
}: CopyDayMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Copiar el horario del {dayName?.toLowerCase()} a…
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(WORKWEEK)}>
            Lunes a viernes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCopy(ALL_DAYS)}>
            Toda la semana
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
