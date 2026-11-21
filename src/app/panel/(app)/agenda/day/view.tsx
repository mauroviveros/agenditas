"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { NoticeBar } from "@/components/notice-bar";
import { Button } from "@/components/ui/button";
import type { AgendaItem } from "@/lib/appointments/parse";
import { suggestTime } from "@/lib/appointments/suggest";
import { clock } from "@/lib/appointments/summary";
import { openSpans, type Timeline as TimelineData } from "@/lib/appointments/timeline";
import type { HolidayRow } from "@/lib/holidays/parse";
import type { HourRange } from "@/lib/hours/schema";
import type { Service } from "@/lib/services/queries";
import { dateInBuenosAires, formatTime } from "@/lib/time";
import { type AppointmentResult, blockTime, cancelAppointment, restoreAppointment } from "../actions";
import { PanelFooter, PanelHeaderActions } from "../../panel-slots";
import type { AppointmentDraft } from "./draft";
import { AppointmentEditor } from "./editor";
import { agendaHref } from "./href";
import { BlockPanel } from "./block-panel";
import { type AppointmentItem, type BlockItem, Timeline } from "./timeline";

// Cuánto dura un turno mientras todavía no se eligió el servicio, para sugerir una hora libre.
const DEFAULT_MINUTES = 30;

interface AgendaViewProps {
  day: string;
  today: string;
  nowIso: string;
  timeline: TimelineData;
  items: AgendaItem[];
  services: Service[];
  ranges: HourRange[];
  holidays: HolidayRow[];
}

// Lo que se abre: un turno nuevo (con la hora que se sugiere o la del hueco tocado) o un turno que
// se mueve. El `nonce` hace que cada apertura arranque con un formulario limpio.
interface EditorState {
  open: boolean;
  appointment: AppointmentItem | null;
  initial: AppointmentDraft;
  nonce: number;
}

function isInProgress(block: BlockItem | null, nowIso: string): boolean {
  const now = Date.parse(nowIso);
  return block !== null && Date.parse(block.startsAt) <= now && now < Date.parse(block.endsAt);
}

// «Salgo N min» bloquea esta cantidad de minutos desde ahora.
const AWAY_MINUTES = 30;

// Lo que se ve tras cancelar o bloquear: lo necesario para deshacerlo, o el motivo del error.
type Notice =
  | { kind: "cancelled"; appointment: AppointmentItem }
  | { kind: "blocked"; id: string; from: string }
  | { kind: "error"; message: string }
  | null;

// La línea de tiempo del día con su formulario de turno en un Sheet/Drawer, y «Nuevo turno» en el
// encabezado (desde md) o en el pie (en celu).
export function AgendaView({
  day,
  today,
  nowIso,
  timeline,
  items,
  services,
  ranges,
  holidays,
}: AgendaViewProps) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    appointment: null,
    initial: { serviceId: "", clientName: "", clientPhone: "", day, time: "" },
    nonce: 0,
  });

  const [notice, setNotice] = useState<Notice>(null);
  // El bloqueo abierto se queda al cerrarse el panel, para que no se vacíe mientras se anima.
  const [blockPanel, setBlockPanel] = useState<{ open: boolean; block: BlockItem | null }>({
    open: false,
    block: null,
  });
  const [blocking, startBlocking] = useTransition();
  const dismissNotice = useCallback(() => setNotice(null), []);

  // Abrir el formulario deja atrás el aviso: el horario liberado puede ocuparse y el Deshacer ya
  // no vale.
  const openEditor = (appointment: AppointmentItem | null, initial: AppointmentDraft) => {
    setNotice(null);
    setEditor((current) => ({ open: true, appointment, initial, nonce: current.nonce + 1 }));
  };

  function openNew(time?: string) {
    const suggested =
      time ?? suggestTime(day, items, openSpans(day, ranges), new Date(nowIso), DEFAULT_MINUTES);
    openEditor(null, { serviceId: "", clientName: "", clientPhone: "", day, time: suggested });
  }

  function openMove(item: AppointmentItem) {
    openEditor(item, {
      serviceId: "",
      clientName: item.clientName,
      clientPhone: item.clientPhone ?? "",
      day: dateInBuenosAires(new Date(item.startsAt)),
      time: formatTime(item.startsAt),
    });
  }

  // Si el turno quedó en otro día, la pantalla va a ese día; en el mismo, la Server Action ya
  // volvió a leer la agenda.
  function saved(savedDay: string) {
    setEditor((current) => ({ ...current, open: false }));
    if (savedDay !== day) {
      router.push(agendaHref(savedDay, today));
    }
  }

  // Si sale bien, el editor se cierra y se avisa con Deshacer; si no, el error lo muestra el
  // formulario, que sigue abierto.
  async function cancel(appointment: AppointmentItem): Promise<AppointmentResult> {
    const result = await cancelAppointment(appointment.id);
    if (result.ok) {
      setEditor((current) => ({ ...current, open: false }));
      setNotice({ kind: "cancelled", appointment });
    }
    return result;
  }

  function stepOut() {
    startBlocking(async () => {
      const result = await blockTime(AWAY_MINUTES);
      setNotice(
        result.ok
          ? { kind: "blocked", id: result.id, from: formatTime(result.startsAt) }
          : { kind: "error", message: result.error },
      );
    });
  }

  async function removeBlock(block: BlockItem): Promise<AppointmentResult> {
    const result = await cancelAppointment(block.id);
    if (result.ok) {
      setBlockPanel((current) => ({ ...current, open: false }));
    }
    return result;
  }

  function selectItem(item: AgendaItem) {
    if (item.kind === "appointment") {
      openMove(item);
    } else {
      setBlockPanel({ open: true, block: item });
    }
  }

  // Deshacer un bloqueo es cancelarlo: libera el horario igual que un turno.
  async function undoBlock(id: string) {
    setNotice(null);
    const result = await cancelAppointment(id);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
    }
  }

  async function undo(appointment: AppointmentItem) {
    setNotice(null);
    const result = await restoreAppointment(appointment.id);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
    }
  }

  return (
    <>
      <PanelHeaderActions>
        <div className="hidden gap-2 md:flex">
          {day === today ? (
            <Button size="lg" variant="outline" disabled={blocking} aria-busy={blocking} onClick={stepOut}>
              Salgo {AWAY_MINUTES} min
            </Button>
          ) : null}
          <Button size="lg" onClick={() => openNew()}>
            <PlusIcon aria-hidden />
            Nuevo turno
          </Button>
        </div>
      </PanelHeaderActions>
      <PanelFooter className="md:hidden">
        <div className="flex gap-2">
          {day === today ? (
            <Button size="lg" className="flex-1" variant="outline" disabled={blocking} aria-busy={blocking} onClick={stepOut}>
              Salgo {AWAY_MINUTES} min
            </Button>
          ) : null}
          <Button size="lg" className="flex-1" onClick={() => openNew()}>
            <PlusIcon aria-hidden />
            Nuevo turno
          </Button>
        </div>
      </PanelFooter>

      {notice?.kind === "cancelled" ? (
        <NoticeBar
          message={
            <>
              Cancelaste el turno de{" "}
              <span className="font-medium">{notice.appointment.clientName}</span>.
            </>
          }
          onUndo={() => undo(notice.appointment)}
          onDismiss={dismissNotice}
        />
      ) : null}
      {notice?.kind === "blocked" ? (
        <NoticeBar
          message={`Bloqueaste ${AWAY_MINUTES} min desde las ${notice.from}.`}
          onUndo={() => undoBlock(notice.id)}
          onDismiss={dismissNotice}
        />
      ) : null}
      {notice?.kind === "error" ? (
        <NoticeBar message={notice.message} onDismiss={dismissNotice} />
      ) : null}

      <Timeline
        timeline={timeline}
        nowIso={nowIso}
        onSelectItem={selectItem}
        onSelectSlot={(minute) => openNew(clock(minute))}
      />

      <BlockPanel
        key={blockPanel.block?.id}
        block={blockPanel.block}
        inProgress={isInProgress(blockPanel.block, nowIso)}
        open={blockPanel.open}
        onOpenChange={(open) => setBlockPanel((current) => ({ ...current, open }))}
        onRemove={removeBlock}
      />

      <AppointmentEditor
        key={editor.nonce}
        open={editor.open}
        appointment={editor.appointment}
        initial={editor.initial}
        services={services}
        ranges={ranges}
        holidays={holidays}
        onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
        onSaved={saved}
        onCancelAppointment={() =>
          editor.appointment ? cancel(editor.appointment) : Promise.resolve({ ok: true })
        }
      />
    </>
  );
}
