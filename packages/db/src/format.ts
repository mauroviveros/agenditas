// Formato es-AR de lo que muestran el panel y la página pública.

const MINUTES_PER_HOUR = 60;

/** `19500` → `$19.500`. Sin precio: `Consultar`. */
export function formatPrice(pesos: number | null): string {
  if (pesos === null) return "Consultar";
  return `$${String(pesos).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** `90` → `1 h 30 min`; `60` → `1 h`; `45` → `45 min`. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** `09:00:00` (como lo devuelve Postgres) → `09:00`. */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}
