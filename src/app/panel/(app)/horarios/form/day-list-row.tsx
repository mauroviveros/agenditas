"use client";

import { Switch } from "@/components/ui/switch";
import { type Slot, summarizeDay, WEEKDAY_NAMES } from "./week";

interface DayListRowProps {
  day: number;
  slots: readonly Slot[];
  onToggle: () => void;
  onOpen: () => void;
}

// Un día en el celu: el horario en una línea. Tocar la fila abre la hoja para editarlo.
export function DayListRow({ day, slots, onToggle, onOpen }: DayListRowProps) {
  const dayName = WEEKDAY_NAMES[day];
  const isOpen = slots.length > 0;

  return (
    <div data-slot="day-list-row" data-open={isOpen} className="flex items-center gap-3 pr-5">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Editar el horario del ${dayName?.toLowerCase()}`}
        className="flex min-h-16 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 py-2 pl-5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span data-slot="day-name" className="text-[0.8125rem] font-medium text-muted-foreground">
          {dayName}
        </span>
        <span
          data-slot="day-summary"
          className={`tabular-nums ${isOpen ? "text-[1.0625rem] font-semibold tracking-tight" : "text-sm text-muted-foreground"}`}
        >
          {summarizeDay(slots)}
        </span>
      </button>
      <Switch
        checked={isOpen}
        onCheckedChange={onToggle}
        aria-label={`${dayName}: ${isOpen ? "atiende" : "no atiende"}`}
      />
    </div>
  );
}
