"use client";

import { ChevronsUpDownIcon, CircleAlertIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { hoursSchema } from "@/lib/hours";
import { SlotFields } from "./slot-fields";
import {
  ALL_DAYS,
  joinLunch,
  MAX_SLOTS_PER_DAY,
  type Slot,
  splitLunch,
  WEEKDAY_NAMES,
  WORKWEEK,
} from "./week";

// A qué días se copia lo que se edita acá: ninguno más, lunes a viernes o toda la semana.
const TARGETS = {
  day: { label: "Solo este día", days: [] },
  workweek: { label: "Lunes a viernes", days: WORKWEEK },
  all: { label: "Toda la semana", days: ALL_DAYS },
} as const;
type Target = keyof typeof TARGETS;

interface DaySheetProps {
  day: number;
  /** Franjas con las que abre; si el día estaba cerrado, la propuesta de apertura. */
  initial: readonly Slot[];
  /** `copyTo`: los otros días que reciben este horario (vacío si es solo este). */
  onApply: (slots: readonly Slot[], copyTo: readonly number[]) => void;
  onClose: () => void;
}

// Editor de un día en el celu: se arma un borrador y recién "Listo" lo pasa a la semana.
export function DaySheet({ day, initial, onApply, onClose }: DaySheetProps) {
  const dayName = WEEKDAY_NAMES[day];
  const errorId = useId();
  const [draft, setDraft] = useState(initial);
  const [target, setTarget] = useState<Target>("day");
  const targetId = useId();
  const targetValueId = useId();

  // El día no importa para validar: solo el orden y el solapamiento de este borrador.
  const parsed = hoursSchema.safeParse(
    draft.map((slot) => ({ weekday: 1, ...slot })),
  );
  const error = parsed.success
    ? null
    : (parsed.error.issues[0]?.message ?? null);
  const [first, second] = draft;

  const changeSlot = (index: number, field: keyof Slot, value: string) =>
    setDraft(
      draft.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    );

  return (
    <Sheet open onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent side="bottom" className="rounded-t-xl p-5">
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
                {draft.length === 1
                  ? "Atiende"
                  : index === 0
                    ? "Mañana"
                    : "Tarde"}
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
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={Boolean(error) || splitLunch(draft) === draft}
            onClick={() => setDraft(splitLunch(draft))}
          >
            <PlusIcon aria-hidden data-icon="inline-start" />
            Cortar para almorzar
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-11"
            onClick={() => setDraft(joinLunch(draft))}
          >
            Sacar el almuerzo
          </Button>
        )}

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div
          data-slot="apply-to"
          className="flex items-center justify-between gap-3"
        >
          <p
            id={targetId}
            className="text-sm font-medium text-muted-foreground"
          >
            Aplicar a
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 min-w-44 justify-between text-base font-medium"
                  aria-labelledby={`${targetId} ${targetValueId}`}
                />
              }
            >
              <span id={targetValueId}>{TARGETS[target].label}</span>
              <ChevronsUpDownIcon aria-hidden data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={target}
                onValueChange={(value) => setTarget(value as Target)}
              >
                {(Object.keys(TARGETS) as Target[]).map((key) => (
                  <DropdownMenuRadioItem
                    key={key}
                    value={key}
                    className="min-h-11 text-base"
                  >
                    {TARGETS[key].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-11"
          disabled={!parsed.success}
          onClick={() => onApply(draft, TARGETS[target].days)}
        >
          Listo
        </Button>
      </SheetContent>
    </Sheet>
  );
}
