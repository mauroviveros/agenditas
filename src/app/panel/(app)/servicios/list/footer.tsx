import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableFooterProps {
  total: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

// Cuántos servicios hay y, si no entran en una página, qué rango se ve y cómo pasar de
// página. En celu los botones son solo la flecha: el texto queda para lectores de pantalla.
export function TableFooter({
  total,
  pageIndex,
  pageSize,
  pageCount,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: TableFooterProps) {
  const label =
    pageCount > 1
      ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, total)} de ${total} servicios`
      : `${total} ${total === 1 ? "servicio" : "servicios"}`;

  return (
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <span aria-live="polite">{label}</span>
      {pageCount > 1 ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-11 px-0 md:w-auto md:px-2.5"
            disabled={!canPrevious}
            onClick={onPrevious}
          >
            <ChevronLeftIcon aria-hidden />
            <span className="sr-only md:not-sr-only">Anterior</span>
          </Button>
          <Button
            variant="outline"
            className="w-11 px-0 md:w-auto md:px-2.5"
            disabled={!canNext}
            onClick={onNext}
          >
            <span className="sr-only md:not-sr-only">Siguiente</span>
            <ChevronRightIcon aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
