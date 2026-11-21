"use client";

import { CircleAlertIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/services/queries";
import { MAX_SERVICES } from "@/lib/services/schema";
import { PanelHeaderActions } from "../../panel-slots";
import { type ServiceResult, deleteService, saveService } from "../actions";
import { ServiceEditor } from "./editor";
import { ServicesTable } from "./table";

const UNDO_WINDOW_MS = 6000;
const LIMIT_MESSAGE = `Llegaste al máximo de ${MAX_SERVICES} servicios.`;

// Lo que se ve tras borrar: el servicio para recrearlo, o el motivo por el que no se pudo.
type Notice =
  | { kind: "deleted"; service: Service }
  | { kind: "error"; message: string }
  | null;

// El editor se queda con el último servicio al cerrarse, para que el panel no se vacíe
// mientras se anima la salida.
interface EditorState {
  open: boolean;
  service: Service | null;
}

// Encabezado con «Nuevo servicio», la tabla (o el vacío) y el formulario en un Sheet/Drawer.
export function ServicesView({ services }: { services: Service[] }) {
  const [editor, setEditor] = useState<EditorState>({ open: false, service: null });
  const [notice, setNotice] = useState<Notice>(null);
  const isFull = services.length >= MAX_SERVICES;
  const limitId = useId();
  // Lo que se edita se lee de la lista al día; si ya no está (se borró desde otro lado), el
  // editor se cierra solo.
  const editing = editor.service
    ? (services.find(({ id }) => id === editor.service?.id) ?? null)
    : null;
  const editorOpen = editor.open && (editor.service === null || editing !== null);

  const dismissNotice = useCallback(() => setNotice(null), []);
  const openNew = () => setEditor({ open: true, service: null });
  const openEdit = (service: Service) => setEditor({ open: true, service });
  const closeEditor = (open: boolean) => setEditor((current) => ({ ...current, open }));

  // El error de un borrado lo muestra el formulario, que sigue abierto; acá solo se cierra el
  // editor y se avisa con Deshacer cuando salió bien.
  async function remove(service: Service): Promise<ServiceResult> {
    const result = await deleteService(service.id);
    if (result.ok) {
      closeEditor(false);
      setNotice({ kind: "deleted", service });
    }
    return result;
  }

  async function undo(service: Service) {
    setNotice(null);
    const { name, duration_minutes, price_cents } = service;
    const result = await saveService({ name, duration_minutes, price_cents });
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
    }
  }

  return (
    <section aria-labelledby="services-heading" className="flex flex-col gap-4">
      <PanelHeaderActions>
        {/* En celu solo el ícono; el texto queda para lectores de pantalla. */}
        <Button
          size="lg"
          className="size-11 px-0 aria-disabled:pointer-events-none aria-disabled:opacity-50 md:h-9 md:w-auto md:px-2.5"
          aria-disabled={isFull || undefined}
          aria-describedby={isFull ? limitId : undefined}
          onClick={isFull ? undefined : openNew}
        >
          <PlusIcon aria-hidden />
          <span className="sr-only md:not-sr-only">Nuevo servicio</span>
        </Button>
      </PanelHeaderActions>

      <h2 id="services-heading" className="sr-only">
        Tus servicios
      </h2>
      {isFull ? (
        <p id={limitId} className="font-medium">
          {LIMIT_MESSAGE}
        </p>
      ) : null}

      {notice ? <NoticeBar notice={notice} onUndo={undo} onDismiss={dismissNotice} /> : null}

      {services.length === 0 ? (
        <ServicesEmpty onCreate={openNew} />
      ) : (
        <ServicesTable
          services={services}
          selectedId={editorOpen ? (editor.service?.id ?? null) : null}
          onSelect={openEdit}
        />
      )}

      <ServiceEditor
        key={editor.service?.id ?? "new"}
        open={editorOpen}
        service={editing ?? editor.service}
        onOpenChange={closeEditor}
        onDelete={remove}
      />
    </section>
  );
}

function NoticeBar({
  notice,
  onUndo,
  onDismiss,
}: {
  notice: NonNullable<Notice>;
  onUndo: (service: Service) => void;
  onDismiss: () => void;
}) {
  // El tiempo para deshacer corre solo mientras nadie apunta ni enfoca el aviso: quien lo
  // lee con calma o con un lector de pantalla no lo ve desaparecer.
  const [paused, setPaused] = useState(false);
  const isDeleted = notice.kind === "deleted";

  useEffect(() => {
    if (!isDeleted || paused) {
      return;
    }
    const timer = setTimeout(onDismiss, UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [isDeleted, paused, onDismiss]);

  if (notice.kind === "error") {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
      >
        <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="flex-1 font-medium">{notice.message}</p>
        <Button variant="ghost" size="sm" className="h-11 md:h-7" onClick={onDismiss}>
          Cerrar
        </Button>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg border bg-muted p-4"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="flex-1">
        Borraste <span className="font-medium">{notice.service.name}</span>.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="h-11 md:h-7"
        onClick={() => onUndo(notice.service)}
      >
        Deshacer
      </Button>
    </div>
  );
}

// Sin servicios no hay agenda que armar: el aviso dice por dónde empezar.
function ServicesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
      <p className="font-medium">Todavía no cargaste servicios</p>
      <p className="text-muted-foreground">
        Sin servicios tus clientes no pueden sacar turno. Cargá el primero.
      </p>
      <Button size="lg" className="h-11 md:h-9" onClick={onCreate}>
        Cargar el primero
      </Button>
    </div>
  );
}
