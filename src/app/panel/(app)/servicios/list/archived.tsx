"use client";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import type { Service } from "@/lib/services/queries";
import { formatDuration, formatPrice } from "@/lib/services/schema";

interface ArchivedServicesProps {
  services: Service[];
  onRestore: (service: Service) => void;
}

// Los servicios que se archivaron: siguen guardados (los turnos que tuvieron también) y se pueden
// traer de vuelta. No cuentan para el tope de 50.
// shortcut: la lista va completa y sin paginar; plegarla o paginarla si se acumulan.
export function ArchivedServices({ services, onRestore }: ArchivedServicesProps) {
  return (
    <section aria-labelledby="archived-heading" className="flex flex-col gap-2">
      <h3 id="archived-heading" className="font-medium">
        Archivados
      </h3>
      <ItemGroup className="gap-0 divide-y overflow-hidden rounded-xl border bg-card">
        {services.map((service) => (
          <Item key={service.id} size="sm" className="min-h-16 flex-nowrap justify-between rounded-none px-6">
            <ItemContent className="min-w-0 gap-0">
              <ItemTitle className="max-w-full">{service.name}</ItemTitle>
              <ItemDescription className="tabular-nums">
                {formatDuration(service.duration_minutes)} · {formatPrice(service.price_cents)}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Restaurar ${service.name}`}
                onClick={() => onRestore(service)}
              >
                Restaurar
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
