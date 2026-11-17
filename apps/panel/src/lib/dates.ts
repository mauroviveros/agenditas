const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;
const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;
const MS_PER_DAY = 86_400_000;

function toUtc(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Hoy como `YYYY-MM-DD` en la zona del negocio (no en la del navegador ni UTC). */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** `2026-12-08` → `mar 8 de dic`. */
export function formatShortDate(iso: string): string {
  const date = toUtc(iso);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]}`;
}

/** Los días de `from` a `to`, ambos incluidos. Vacío si `to` es anterior. */
export function datesBetween(from: string, to: string): string[] {
  const end = toUtc(to).getTime();
  const days: string[] = [];
  for (let time = toUtc(from).getTime(); time <= end; time += MS_PER_DAY) {
    days.push(toIso(new Date(time)));
  }
  return days;
}

/** El día siguiente a `iso`. */
export function nextDay(iso: string): string {
  return toIso(new Date(toUtc(iso).getTime() + MS_PER_DAY));
}
