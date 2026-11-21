const MINUTES_PER_HOUR = 60;

interface Span {
  from: number;
  to: number;
}

const pad = (value: number) => String(value).padStart(2, "0");
// Minutos desde la medianoche como "HH:mm".
export const clock = (minute: number) =>
  `${pad(Math.floor(minute / MINUTES_PER_HOUR))}:${pad(minute % MINUTES_PER_HOUR)}`;

// La bajada del día: cuántos turnos hay y cuándo atiende ("6 turnos · atendés de 09:00 a 13:00
// y de 15:00 a 19:00"). Los bloqueos no cuentan como turnos.
export function describeDay(appointments: number, open: Span[]): string {
  const turns =
    appointments === 0
      ? "No hay turnos este día"
      : appointments === 1
        ? "1 turno"
        : `${appointments} turnos`;
  const hours =
    open.length === 0
      ? "no atendés este día"
      : `atendés ${open.map(({ from, to }) => `de ${clock(from)} a ${clock(to)}`).join(" y ")}`;
  return `${turns} · ${hours}`;
}
