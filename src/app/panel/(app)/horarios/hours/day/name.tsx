import { Badge } from "@/components/ui/badge";

// El nombre de un día, con la marca "Hoy" si es el día de hoy.
export function DayName({
  name,
  isToday,
  className,
}: {
  name: string | undefined;
  isToday: boolean;
  className: string;
}) {
  return (
    <span data-slot="day-name" className={`flex items-center gap-1.5 ${className}`}>
      {name}
      {isToday ? <Badge data-slot="day-today">Hoy</Badge> : null}
    </span>
  );
}
