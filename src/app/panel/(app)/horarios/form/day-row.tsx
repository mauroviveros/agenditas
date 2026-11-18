"use client";

import { CircleAlertIcon, PlusIcon, XIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DayName } from "./day-name";
import { SlotFields } from "./slot-fields";
import {
  dayDuration,
  joinLunch,
  MAX_SLOTS_PER_DAY,
  type Slot,
  splitLunch,
  WEEKDAY_NAMES,
} from "./week";

interface DayRowProps {
  day: number;
  slots: readonly Slot[];
  isToday: boolean;
  /** Aviso por franja (posición dentro del día) que no pasa la validación. */
  errors: ReadonlyMap<number, string>;
  onToggle: () => void;
  onChange: (slots: readonly Slot[]) => void;
}

// Un día en escritorio: interruptor, franjas en línea y, entre dos, el almuerzo.
export function DayRow({
  day,
  isToday,
  slots,
  errors,
  onToggle,
  onChange,
}: DayRowProps) {
  const dayName = WEEKDAY_NAMES[day];
  const baseId = useId();
  const isOpen = slots.length > 0;
  const [first, second] = slots;
  // Sin franja válida (o con aviso) o muy corta no hay de dónde sacar el almuerzo.
  const canSplit = errors.size === 0 && splitLunch(slots) !== slots;
  const hasLunch =
    first !== undefined &&
    second !== undefined &&
    second.start_time > first.end_time;

  const changeSlot = (index: number, field: keyof Slot, value: string) =>
    onChange(
      slots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    );

  return (
    <div
      data-slot="day-row"
      data-open={isOpen}
      className="grid min-h-[88px] grid-cols-[8rem_auto_1fr] items-center gap-x-6 px-6 py-3"
    >
      <div className="flex flex-col gap-0.5">
        <DayName
          name={dayName}
          isToday={isToday}
          className="text-sm font-medium text-muted-foreground"
        />
        {isOpen ? (
          <span
            data-slot="day-duration"
            className="text-xs text-muted-foreground tabular-nums"
          >
            {dayDuration(slots)}
          </span>
        ) : null}
      </div>
      <Switch
        checked={isOpen}
        onCheckedChange={onToggle}
        aria-label={`${dayName}: ${isOpen ? "atiende" : "no atiende"}`}
      />

      {isOpen ? (
        <div data-slot="day-slots" className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-[1400px]:flex-nowrap">
            {slots.map((slot, index) => {
              const error = errors.get(index);
              return (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 min-[1400px]:flex-nowrap"
                >
                  {index === 1 && hasLunch && first ? (
                    <span
                      data-slot="lunch-chip"
                      className="whitespace-nowrap inline-flex h-11 items-center rounded-full border border-dashed border-input px-4 text-sm font-medium tabular-nums text-muted-foreground"
                    >
                      almuerzo {first.end_time}–{slot.start_time}
                    </span>
                  ) : null}
                  <SlotFields
                    label={dayName ?? ""}
                    slot={slot}
                    invalid={Boolean(error)}
                    describedBy={`${baseId}-error`}
                    onChange={(field, value) => changeSlot(index, field, value)}
                  />
                </div>
              );
            })}

            {slots.length < MAX_SLOTS_PER_DAY ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-primary"
                disabled={!canSplit}
                onClick={() => onChange(splitLunch(slots))}
              >
                <PlusIcon aria-hidden data-icon="inline-start" />
                Almuerzo
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="size-11"
                aria-label={`Sacar el almuerzo del ${dayName?.toLowerCase()}`}
                onClick={() => onChange(joinLunch(slots))}
              >
                <XIcon aria-hidden />
              </Button>
            )}
          </div>

          {errors.size > 0 ? (
            <p
              role="alert"
              id={`${baseId}-error`}
              className="flex items-center gap-1.5 text-sm font-semibold"
            >
              <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
              {[...errors.values()][0]}
            </p>
          ) : null}
        </div>
      ) : (
        <span data-slot="day-closed" className="text-muted-foreground">
          No atiende
        </span>
      )}
    </div>
  );
}
