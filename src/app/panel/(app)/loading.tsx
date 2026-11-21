import { Skeleton } from "@/components/ui/skeleton";
import { PanelPage } from "./panel-page";

// Esqueleto de Inicio (estado vacío). Next lo muestra solo, en un <Suspense> alrededor de la
// página; cada ruta nueva trae su loading.tsx con su propia forma. El título es el nombre del
// negocio, que acá todavía no se conoce: el encabezado queda sin texto hasta que llega.
export default function Loading() {
  return (
    <PanelPage title={"\u00a0"}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Skeleton className="h-28" />
      </div>
    </PanelPage>
  );
}
