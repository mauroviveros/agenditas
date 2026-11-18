"use client";

import { Input } from "@/components/ui/input";
import type { Slot } from "./week";

interface SlotFieldsProps {
  /** Cómo se anuncia al lector de pantalla: "Lunes", "Martes, tarde", etc. */
  label: string;
  slot: Slot;
  onChange: (field: keyof Slot, value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

// Un par de horas, de inicio y de fin. Lo usan la fila de escritorio y la hoja del celu.
export function SlotFields({ label, slot, onChange, invalid, describedBy }: SlotFieldsProps) {
  const shared = {
    type: "time",
    className: "min-w-0 flex-1 tabular-nums md:w-[7.5rem] md:flex-none",
    "aria-invalid": invalid ? true : undefined,
    "aria-describedby": invalid ? describedBy : undefined,
  } as const;

  return (
    <div className="flex items-center gap-2">
      <Input
        {...shared}
        aria-label={`${label}, desde`}
        value={slot.start_time}
        onChange={(event) => onChange("start_time", event.target.value)}
      />
      <span aria-hidden className="text-muted-foreground">
        a
      </span>
      <Input
        {...shared}
        aria-label={`${label}, hasta`}
        value={slot.end_time}
        onChange={(event) => onChange("end_time", event.target.value)}
      />
    </div>
  );
}
