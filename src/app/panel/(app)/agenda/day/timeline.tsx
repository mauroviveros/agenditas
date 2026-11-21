"use client";

import type { MouseEvent } from "react";
import type { AgendaItem } from "@/lib/appointments/parse";
import { snapMinute } from "@/lib/appointments/suggest";
import { clock } from "@/lib/appointments/summary";
import type { Timeline as TimelineData, TimelineBlock } from "@/lib/appointments/timeline";
import { formatTime, formatUntil } from "@/lib/time";
import { cn } from "cn";

export type AppointmentItem = Extract<AgendaItem, { kind: "appointment" }>;
export type BlockItem = Extract<AgendaItem, { kind: "block" }>;

// 1,6 px por minuto: 30 minutos miden 48 px y una hora, 96 px.
// shortcut: escala fija; un turno de 5 minutos mide 8 px y se estira a 20 px (min-h-5), lo que lo
// puede encimar con el siguiente si vienen pegados, y no llega a los 44 px de toque. Resolverlo
// cuando se defina cómo se toca un turno corto.
const PX_PER_MINUTE = 1.6;
const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60_000;
// Hasta 30 minutos (48 px) el turno entra en una sola línea.
const SHORT_MINUTES = 30;

const BAND_STYLES = {
  closed: "bg-muted",
  lunch: "bg-[repeating-linear-gradient(135deg,var(--muted)_0_6px,var(--border)_6px_7px)]",
} as const;

// Lo que acompaña a un turno que importa ahora: «Ahora» si está en curso, «En 28 min» si viene.
function statusLabel(block: TimelineBlock, now: Date): string | null {
  if (block.status === "current") {
    return "Ahora";
  }
  if (block.status === "next") {
    const minutes = Math.ceil((Date.parse(block.item.startsAt) - now.getTime()) / MS_PER_MINUTE);
    return `En ${formatUntil(Math.max(1, minutes))}`;
  }
  return null;
}

interface TimelineProps {
  timeline: TimelineData;
  /** La hora actual, como instante ISO: así llega igual del servidor al navegador. */
  nowIso: string;
  /** Tocar un turno. */
  onSelectItem: (item: AgendaItem) => void;
  /** Tocar un hueco: el minuto desde la medianoche, redondeado al cuarto de hora. */
  onSelectSlot: (minute: number) => void;
}

// El día como línea de tiempo: las horas a la izquierda y cada turno o bloqueo con la altura de su
// duración. Lo cerrado y el almuerzo se pintan aparte; los turnos pasados se apagan y el que está
// en curso o viene después va resaltado. Una línea roja marca la hora actual. Para el lector de
// pantalla es una lista de turnos; las horas del costado son decoración, y tocar un hueco es un
// atajo para el puntero (el botón «Nuevo turno» es la entrada para teclado y lector de pantalla).
export function Timeline({ timeline, nowIso, onSelectItem, onSelectSlot }: TimelineProps) {
  const { fromMinute, toMinute, bands, blocks, nowMinute } = timeline;
  const now = new Date(nowIso);
  const top = (minute: number) => (minute - fromMinute) * PX_PER_MINUTE;
  const hours = Array.from(
    { length: Math.floor((toMinute - fromMinute) / MINUTES_PER_HOUR) },
    (_, index) => fromMinute + index * MINUTES_PER_HOUR,
  );

  function selectSlot(event: MouseEvent<HTMLButtonElement>) {
    const { top: columnTop } = event.currentTarget.getBoundingClientRect();
    const minute = fromMinute + (event.clientY - columnTop) / PX_PER_MINUTE;
    onSelectSlot(Math.min(snapMinute(minute), toMinute));
  }

  return (
    <div
      className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] overflow-hidden rounded-xl border bg-card"
      style={{ height: top(toMinute) }}
    >
      <div aria-hidden className="relative">
        {hours.map((minute, index) => (
          <span
            key={minute}
            className={cn(
              "absolute right-2 bg-card px-0.5 text-xs text-muted-foreground tabular-nums",
              index === 0 ? "translate-y-1" : "-translate-y-1/2",
            )}
            style={{ top: top(minute) }}
          >
            {clock(minute)}
          </span>
        ))}
      </div>

      <div className="relative border-l">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 cursor-pointer"
          onClick={selectSlot}
        />

        {hours.slice(1).map((minute) => (
          <i
            key={minute}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 border-t"
            style={{ top: top(minute) }}
          />
        ))}

        {bands.map((band) => (
          <div
            key={band.from}
            className={cn(
              "pointer-events-none absolute inset-x-0 px-2.5 py-1 text-xs text-muted-foreground",
              BAND_STYLES[band.kind],
            )}
            style={{ top: top(band.from), height: (band.to - band.from) * PX_PER_MINUTE }}
          >
            {band.kind === "lunch"
              ? `Almuerzo · ${clock(band.from)}–${clock(band.to)}`
              : "Cerrado"}
          </div>
        ))}

        <ol aria-label="Turnos del día" className="pointer-events-none absolute inset-0">
          {blocks.map((block) => (
            <TimelineItem
              key={block.item.id}
              block={block}
              now={now}
              top={top(block.startMinute)}
              onSelect={onSelectItem}
            />
          ))}
        </ol>
      </div>

      {nowMinute !== null ? (
        <div
          aria-hidden
          data-slot="timeline-now"
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-destructive"
          style={{ top: top(nowMinute) }}
        >
          <b className="absolute -top-2.5 left-1 rounded-md bg-destructive px-1.5 text-xs leading-[18px] font-semibold text-card tabular-nums">
            {formatTime(now.toISOString())}
          </b>
          <span className="absolute -top-1.5 left-[3.25rem] size-2.5 -translate-x-1/2 rounded-full bg-destructive" />
        </div>
      ) : null}
    </div>
  );
}

const ROW =
  "box-border flex size-full flex-wrap items-baseline gap-x-2 gap-y-0.5 overflow-hidden rounded-lg border px-2.5 py-1 text-left text-sm leading-tight";

function TimelineItem({
  block,
  now,
  top,
  onSelect,
}: {
  block: TimelineBlock;
  now: Date;
  top: number;
  onSelect: (item: AgendaItem) => void;
}) {
  const { item, startMinute, endMinute, status } = block;
  const highlighted = item.kind === "appointment" && (status === "current" || status === "next");
  const label = item.kind === "appointment" ? statusLabel(block, now) : null;
  const rowClass = cn(
    ROW,
    endMinute - startMinute <= SHORT_MINUTES && "flex-nowrap items-center py-0 text-xs whitespace-nowrap",
    item.kind === "block"
      ? "border-dashed bg-[repeating-linear-gradient(135deg,var(--card)_0_6px,var(--muted)_6px_7px)] text-muted-foreground"
      : highlighted
        ? "border-primary bg-primary text-primary-foreground"
        : status === "past"
          ? "bg-secondary text-muted-foreground"
          : "bg-secondary text-foreground",
  );
  const time = (
    <span className={cn("text-xs tabular-nums", highlighted ? "opacity-80" : "text-muted-foreground")}>
      {formatTime(item.startsAt)}–{formatTime(item.endsAt)}
    </span>
  );

  return (
    <li
      className="pointer-events-auto absolute inset-x-1.5 min-h-5"
      style={{ top, height: (endMinute - startMinute) * PX_PER_MINUTE }}
    >
      <button
        type="button"
        className={cn(rowClass, "cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50")}
        onClick={() => onSelect(item)}
      >
        {item.kind === "appointment" ? (
          <>
            {time}{" "}
            <span className={cn(status === "past" ? "font-medium" : "font-semibold")}>{item.clientName}</span>{" "}
            <span className={cn("text-xs", highlighted ? "opacity-80" : "text-muted-foreground")}>
              {item.serviceName}
            </span>
            {label ? <span className="ml-auto pl-2 text-xs font-semibold">{label}</span> : null}
          </>
        ) : (
          <>
            {time} <span>Bloqueado</span>
          </>
        )}
      </button>
    </li>
  );
}
