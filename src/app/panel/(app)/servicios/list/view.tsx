"use client";

import { PlusIcon } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { NoticeBar } from "@/components/notice-bar";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/services/queries";
import { MAX_SERVICES } from "@/lib/services/schema";
import { cn } from "cn";
import { PanelFooter, PanelHeaderActions } from "../../panel-slots";
import { type ServiceResult, deleteService, restoreService } from "../actions";
import { ServiceEditor } from "./editor";
import { ServicesTable } from "./table";

const LIMIT_MESSAGE = `Llegaste al máximo de ${MAX_SERVICES} servicios.`;

// Lo que se ve tras borrar: el servicio para restaurarlo, o el motivo por el que no se pudo.
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
    const result = await restoreService(service.id);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
    }
  }

  return (
    <section aria-labelledby="services-heading" className="flex flex-col gap-4">
      {/* Desde md, en el encabezado; en celu, en el pie y al alcance del pulgar. Con la lista vacía
          el aviso ya trae su «Cargar el primero». */}
      <PanelHeaderActions>
        <NewServiceButton
          className="hidden md:inline-flex"
          isFull={isFull}
          limitId={limitId}
          onClick={openNew}
        />
      </PanelHeaderActions>
      {services.length > 0 ? (
        <PanelFooter className="md:hidden">
          <NewServiceButton className="w-full" isFull={isFull} limitId={limitId} onClick={openNew} />
        </PanelFooter>
      ) : null}

      <h2 id="services-heading" className="sr-only">
        Tus servicios
      </h2>
      {isFull ? (
        <p id={limitId} className="font-medium">
          {LIMIT_MESSAGE}
        </p>
      ) : null}

      {notice?.kind === "deleted" ? (
        <NoticeBar
          message={
            <>
              Borraste <span className="font-medium">{notice.service.name}</span>.
            </>
          }
          onUndo={() => undo(notice.service)}
          onDismiss={dismissNotice}
        />
      ) : null}
      {notice?.kind === "error" ? (
        <NoticeBar message={notice.message} onDismiss={dismissNotice} />
      ) : null}

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

function NewServiceButton({
  className,
  isFull,
  limitId,
  onClick,
}: {
  className?: string;
  isFull: boolean;
  limitId: string;
  onClick: () => void;
}) {
  return (
    <Button
      size="lg"
      className={cn("aria-disabled:pointer-events-none aria-disabled:opacity-50", className)}
      aria-disabled={isFull || undefined}
      aria-describedby={isFull ? limitId : undefined}
      onClick={isFull ? undefined : onClick}
    >
      <PlusIcon aria-hidden />
      Nuevo servicio
    </Button>
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
      <Button size="lg" onClick={onCreate}>
        Cargar el primero
      </Button>
    </div>
  );
}
