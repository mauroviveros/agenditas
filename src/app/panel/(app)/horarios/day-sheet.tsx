"use client";

import { CircleAlertIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { hoursSchema } from "@/lib/hours";
import { SlotFields } from "./slot-fields";
import { joinLunch, MAX_SLOTS_PER_DAY, type Slot, splitLunch, WEEKDAY_NAMES } from "./week";

interface DaySheetProps {
  day: number;
  /** Franjas con las que abre; si el día estaba cerrado, la propuesta de apertura. */
  initial: readonly Slot[];
  onApply: (slots: readonly Slot[], toWorkweek: boolean) => void;
  onClose: () => void;
}

// Editor de un día en el celu: se arma un borrador y recién "Listo" lo pasa a la semana.
export function DaySheet({ day, initial, onApply, onClose }: DaySheetProps) {
  const dayName = WEEKDAY_NAMES[day];
  const errorId = useId();
  const [draft, setDraft] = useState(initial);
  const [toWorkweek, setToWorkweek] = useState(false);

  // El día no importa para validar: solo el orden y el solapamiento de este borrador.
  const parsed = hoursSchema.safeParse(draft.map((slot) => ({ weekday: 1, ...slot })));
  const error = parsed.success ? null : (parsed.error.issues[0]?.message ?? null);
  const [first, second] = draft;

  const changeSlot = (index: number, field: keyof Slot, value: string) =>
    setDraft(draft.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));

  return (
    <Sheet open onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent side="bottom" className="rounded-t-panel p-5">
        <SheetHeader className="p-0">
          <SheetTitle className="text-xl font-bold">{dayName}</SheetTitle>
          <SheetDescription>
            {first && second
              ? `Almuerzo de ${first.end_time} a ${second.start_time}`
              : "Corrido, sin almuerzo"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {draft.map((slot, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-muted-foreground">
                {draft.length === 1 ? "Atiende" : index === 0 ? "Mañana" : "Tarde"}
              </span>
              <SlotFields
                label={`${dayName}, ${draft.length === 1 ? "horario" : index === 0 ? "mañana" : "tarde"}`}
                slot={slot}
                invalid={Boolean(error)}
                describedBy={errorId}
                onChange={(field, value) => changeSlot(index, field, value)}
              />
            </div>
          ))}
        </div>

        {draft.length < MAX_SLOTS_PER_DAY ? (
          <Button type="button" variant="outline" className="h-11" onClick={() => setDraft(splitLunch(draft))}>
            <PlusIcon aria-hidden data-icon="inline-start" />
            Cortar para almorzar
          </Button>
        ) : (
          <Button type="button" variant="ghost" className="h-11" onClick={() => setDraft(joinLunch(draft))}>
            Sacar el almuerzo
          </Button>
        )}

        {error ? (
          <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm font-semibold">
            <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <Label className="min-h-11 text-base font-medium">
          <Checkbox checked={toWorkweek} onCheckedChange={(checked) => setToWorkweek(checked === true)} />
          Usar este horario de lunes a viernes
        </Label>

        <Button
          type="button"
          size="xl"
          disabled={!parsed.success}
          onClick={() => onApply(draft, toWorkweek)}
        >
          Listo
        </Button>
      </SheetContent>
    </Sheet>
  );
}
