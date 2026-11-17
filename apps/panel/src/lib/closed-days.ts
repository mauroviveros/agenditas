import { nextDay } from "./dates";

export interface ClosedDay {
  on_date: string;
  note: string | null;
}

export interface ClosedRange {
  from: string;
  to: string;
  note: string | null;
  dates: string[];
}

/** Junta los días seguidos con la misma nota en un solo tramo («vacaciones del 21 al 25»). */
export function groupClosedDays(days: readonly ClosedDay[]): ClosedRange[] {
  const sorted = [...days].sort((a, b) => a.on_date.localeCompare(b.on_date));
  const ranges: ClosedRange[] = [];
  for (const day of sorted) {
    const last = ranges.at(-1);
    if (last && last.note === day.note && nextDay(last.to) === day.on_date) {
      ranges[ranges.length - 1] = {
        ...last,
        to: day.on_date,
        dates: [...last.dates, day.on_date],
      };
    } else {
      ranges.push({
        from: day.on_date,
        to: day.on_date,
        note: day.note,
        dates: [day.on_date],
      });
    }
  }
  return ranges;
}
