import type { Week } from "./week";

// Avisos de la validación, ubicados en su franja (día y posición dentro del día). Los que
// no son de una franja (por ejemplo, demasiadas) van aparte.
export function placeIssues(
  week: Week,
  issues: readonly { path: PropertyKey[]; message: string }[],
) {
  const positions = week.flatMap((slots, day) =>
    slots.map((_, slot) => ({ day, slot })),
  );
  const byDay = new Map<number, Map<number, string>>();
  const general: string[] = [];
  for (const { path, message } of issues) {
    const position =
      typeof path[0] === "number" ? positions[path[0]] : undefined;
    if (position) {
      const slots = byDay.get(position.day) ?? new Map<number, string>();
      slots.set(position.slot, slots.get(position.slot) ?? message);
      byDay.set(position.day, slots);
    } else {
      general.push(message);
    }
  }
  return { byDay, general };
}
