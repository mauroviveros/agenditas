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
      {isToday ? (
        <span
          data-slot="day-today"
          className="rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] leading-none font-semibold text-primary-foreground"
        >
          Hoy
        </span>
      ) : null}
    </span>
  );
}
