"use client";

import { Switch } from "@/components/ui/switch";
import { DayName } from "./day-name";
import { dayDuration, type Slot, summarizeDay, WEEKDAY_NAMES } from "./week";

interface DayListRowProps {
  day: number;
  isToday: boolean;
  slots: readonly Slot[];
  onToggle: () => void;
  onOpen: () => void;
}

// Un día en el celu: el horario en una línea. Tocar la fila abre la hoja para editarlo.
export function DayListRow({
  day,
  isToday,
  slots,
  onToggle,
  onOpen,
}: DayListRowProps) {
  const dayName = WEEKDAY_NAMES[day];
  const isOpen = slots.length > 0;

  return (
    <div
      data-slot="day-list-row"
      data-open={isOpen}
      className="flex items-center gap-3 pr-5"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Editar el horario del ${dayName?.toLowerCase()}`}
        className="flex min-h-16 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 py-2 pl-5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <DayName
          name={dayName}
          isToday={isToday}
          className="text-[0.8125rem] font-medium text-muted-foreground"
        />
        <span className="flex items-baseline gap-2">
          <span
            data-slot="day-summary"
            className={`tabular-nums ${isOpen ? "text-[1.0625rem] font-semibold tracking-tight" : "text-sm text-muted-foreground"}`}
          >
            {summarizeDay(slots)}
          </span>
          {isOpen ? (
            <span
              data-slot="day-duration"
              className="text-xs text-muted-foreground tabular-nums"
            >
              {dayDuration(slots)}
            </span>
          ) : null}
        </span>
      </button>
      <Switch
        checked={isOpen}
        onCheckedChange={onToggle}
        // Zona de toque de 44 px de alto (la base trae 34).
        className="after:-inset-y-3.5"
        aria-label={`${dayName}: ${isOpen ? "atiende" : "no atiende"}`}
      />
    </div>
  );
}
