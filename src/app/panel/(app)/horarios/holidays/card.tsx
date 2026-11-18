import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// El marco de la card: el título está en todos los estados; adentro va lo que toque.
export function HolidaysCard({ children }: { children: ReactNode }) {
  return (
    <Card role="region" aria-labelledby="holidays-title" className="gap-0 py-0">
      <CardHeader className="border-b px-6 pt-5">
        <CardTitle
          id="holidays-title"
          role="heading"
          aria-level={2}
          className="text-xl font-semibold tracking-tight"
        >
          Próximos feriados
        </CardTitle>
        <CardDescription>Para que no te agarren de sorpresa.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  );
}
