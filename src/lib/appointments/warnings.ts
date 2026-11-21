interface Span {
  from: number;
  to: number;
}

export interface SlotWarning {
  kind: "holiday" | "lunch" | "closed";
  message: string;
}

// Los avisos de un horario que el solista elige. Ninguno frena: el turno se guarda igual, porque a
// veces se atiende fuera de horario. `open` son los tramos en que atiende ese día; `holiday`, el
// nombre del feriado si lo es.
// Un turno está bien si entra entero en un tramo; si pisa el hueco entre dos tramos es el almuerzo,
// y si no, fuera de horario.
export function slotWarnings({
  startMinute,
  endMinute,
  open,
  holiday,
}: {
  startMinute: number;
  endMinute: number;
  open: Span[];
  holiday: string | null;
}): SlotWarning[] {
  const warnings: SlotWarning[] = [];
  if (holiday !== null) {
    warnings.push({ kind: "holiday", message: `Es feriado: ${holiday}.` });
  }

  const inside = open.some((span) => startMinute >= span.from && endMinute <= span.to);
  if (inside) {
    return warnings;
  }
  const touchesLunch = open
    .slice(1)
    .some((span, index) => startMinute < span.from && endMinute > open[index].to);
  warnings.push(
    touchesLunch
      ? { kind: "lunch", message: "Ese horario es tu almuerzo." }
      : { kind: "closed", message: "Ese horario está fuera de tu horario." },
  );
  return warnings;
}
