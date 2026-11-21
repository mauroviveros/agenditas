import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  /** Id del título: la región se nombra con él. */
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

// Receta de cada sección de una pantalla de formulario: card con su título (un h2 de 16 px
// semibold; el h1 del encabezado mide lo mismo en medium, así que la jerarquía la da el
// lugar y no el tamaño), su bajada y las filas sin padding lateral. Las filas ponen el suyo.
export function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <Card role="region" aria-labelledby={id} className="gap-0 py-0">
      <CardHeader className="border-b px-6 pt-5">
        <CardTitle id={id} role="heading" aria-level={2} className="font-semibold">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  );
}
