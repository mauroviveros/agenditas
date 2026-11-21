import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PanelFooter } from "../../panel-slots";

export const SAVED_MESSAGE = "Listo, guardamos tus horarios.";

interface FormFooterProps {
  /** Id del <form>: el botón de guardar vive en el pie del panel, fuera del <form> en el DOM. */
  formId: string;
  /** Un aviso (error al guardar o de la validación). Manda sobre lo demás. */
  notice: string | null;
  saved: boolean;
  /** Lo que se dijo al copiar un día a otros; sin copia reciente, null. */
  copyMessage: string | null;
  isDirty: boolean;
  canSave: boolean;
  isPending: boolean;
  onUndo: () => void;
  onDiscard: () => void;
}

// El pie del panel con el estado de la semana y sus acciones: Deshacer (la última copia),
// Descartar y Guardar.
export function FormFooter({
  formId,
  notice,
  saved,
  copyMessage,
  isDirty,
  canSave,
  isPending,
  onUndo,
  onDiscard,
}: FormFooterProps) {
  return (
    <PanelFooter>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <p
          aria-hidden
          className="flex min-h-5 flex-1 items-center gap-1.5 text-sm font-semibold"
        >
          {notice ? (
            <>
              <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
              {notice}
            </>
          ) : saved ? (
            <>
              <CircleCheckIcon aria-hidden className="size-4 shrink-0" />
              {SAVED_MESSAGE}
            </>
          ) : (
            (copyMessage ?? "Cambios sin guardar")
          )}
        </p>

        <div className="flex gap-2">
          {copyMessage ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isPending}
              onClick={onUndo}
            >
              Deshacer
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={!isDirty || isPending}
            onClick={onDiscard}
          >
            Descartar
          </Button>
          <Button
            type="submit"
            form={formId}
            size="lg"
            className="flex-1"
            disabled={!isDirty || !canSave || isPending}
            aria-busy={isPending}
          >
            {isPending ? <Spinner aria-hidden /> : null}
            {isPending ? "Guardando…" : "Guardar horarios"}
          </Button>
        </div>
      </div>
    </PanelFooter>
  );
}
