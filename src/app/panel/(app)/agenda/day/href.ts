// La URL de un día de la agenda. Hoy no lleva ?dia: es la ruta sin parámetro, así «Hoy» y el día de
// hoy son la misma URL.
export function agendaHref(day: string, today: string): string {
  return day === today ? "/panel/agenda" : `/panel/agenda?dia=${day}`;
}
