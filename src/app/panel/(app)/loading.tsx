import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto de Inicio (título y estado vacío). Next lo muestra solo, en un <Suspense>
// alrededor de la página; cada ruta nueva trae su loading.tsx con su propia forma.
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <Skeleton className="h-9 w-2/3 md:h-11" />
      <Skeleton className="h-28" />
    </div>
  );
}
