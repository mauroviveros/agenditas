import type { WeekDay } from "../lib/week";

// Hoy va resaltado con texto "hoy" para pantallas de lectura (no solo color).
export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <ol aria-label="Semana" className="flex gap-1.5 px-4 pb-3.5 pt-3">
      {days.map((day) => (
        <li
          key={day.weekday}
          aria-current={day.isToday ? "date" : undefined}
          className={`flex h-[68px] flex-1 flex-col items-center justify-center rounded-lg text-sm ${
            day.isToday ? "bg-foreground text-surface" : "text-muted-foreground"
          }`}
        >
          {day.weekday}
          <b
            className={`text-xl font-semibold leading-6 ${day.isToday ? "text-surface" : "text-foreground"}`}
          >
            {day.day}
          </b>
        </li>
      ))}
    </ol>
  );
}
