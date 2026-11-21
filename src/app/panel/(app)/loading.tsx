import { Skeleton } from "@/components/ui/skeleton";

// Esqueleto de Inicio (estado vacío). Next lo muestra solo, en un <Suspense> alrededor de la
// página; cada ruta nueva trae su loading.tsx con su propia forma. El encabezado lo pone el
// layout, así que acá va solo el cuerpo.
export default function Loading() {
  return <Skeleton className="mx-auto h-28 max-w-3xl" />;
}
