"use client";

import { CircleAlertIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/services/queries";
import { MAX_SERVICES } from "@/lib/services/schema";
import { PanelHeaderActions } from "../../panel-slots";
import { deleteService, saveService } from "../actions";
import { ServiceEditor } from "./editor";
import { ServicesEmpty } from "./empty";
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

  useEffect(() => {
    if (notice?.kind !== "deleted") {
      return;
    }
    const timer = setTimeout(() => setNotice(null), UNDO_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const openNew = () => setEditor({ open: true, service: null });
  const openEdit = (service: Service) => setEditor({ open: true, service });
  const closeEditor = (open: boolean) => setEditor((current) => ({ ...current, open }));

  async function remove(service: Service) {
    const result = await deleteService(service.id);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
      return;
    }
    closeEditor(false);
    setNotice({ kind: "deleted", service });
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
          className="size-11 px-0 md:h-9 md:w-auto md:px-2.5"
          disabled={isFull}
          onClick={openNew}
        >
          <PlusIcon aria-hidden />
          <span className="sr-only md:not-sr-only">Nuevo servicio</span>
        </Button>
      </PanelHeaderActions>

      <h2 id="services-heading" className="sr-only">
        Tus servicios
      </h2>
      {isFull ? <p className="font-medium">{LIMIT_MESSAGE}</p> : null}

      {notice ? <NoticeBar notice={notice} onUndo={undo} onDismiss={() => setNotice(null)} /> : null}

      {services.length === 0 ? (
        <ServicesEmpty onCreate={openNew} />
      ) : (
        <ServicesTable
          services={services}
          selectedId={editor.open ? (editor.service?.id ?? null) : null}
          onSelect={openEdit}
        />
      )}

      <ServiceEditor
        key={editor.service?.id ?? "new"}
        open={editor.open}
        service={editor.service}
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
  if (notice.kind === "error") {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
      >
        <CircleAlertIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <p className="flex-1 font-medium">{notice.message}</p>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Cerrar
        </Button>
      </div>
    );
  }
  return (
    <div role="status" className="flex items-center gap-3 rounded-lg border bg-muted p-4">
      <p className="flex-1">
        Borraste <span className="font-medium">{notice.service.name}</span>.
      </p>
      <Button variant="outline" size="sm" onClick={() => onUndo(notice.service)}>
        Deshacer
      </Button>
    </div>
  );
}
