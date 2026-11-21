import { PanelPage } from "../panel-page";
import { Skeleton } from "@/components/ui/skeleton";
import { HolidaysCardSkeleton } from "./holidays/skeleton";
import { HoursFormSkeleton } from "./hours/skeleton";

// Esqueleto de Horarios: el mismo encabezado que la pantalla, la ayuda, los siete días y los feriados.
export default function Loading() {
  return (
    <PanelPage title="Horarios">
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-5 w-4/5" />
        <HoursFormSkeleton />
        <HolidaysCardSkeleton />
      </div>
    </PanelPage>
  );
}
