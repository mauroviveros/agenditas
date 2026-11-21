import { PanelPage } from "../panel-page";
import { ServicesSkeleton } from "./list/skeleton";

// Esqueleto de Servicios: el mismo encabezado que la pantalla y la lista.
export default function Loading() {
  return (
    <PanelPage title="Servicios" subtitle="Lo que ofrecés, cuánto dura y cuánto cuesta.">
      <div className="flex w-full flex-col gap-8">
        <ServicesSkeleton />
      </div>
    </PanelPage>
  );
}
