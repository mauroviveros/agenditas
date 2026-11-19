import { Button } from "@/components/ui/button";

// Sin servicios no hay agenda que armar: el aviso dice por dónde empezar.
export function ServicesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
      <p className="font-medium">Todavía no cargaste servicios</p>
      <p className="text-muted-foreground">
        Sin servicios tus clientes no pueden sacar turno. Cargá el primero.
      </p>
      <Button size="lg" className="h-11 md:h-9" onClick={onCreate}>
        Cargar el primero
      </Button>
    </div>
  );
}
