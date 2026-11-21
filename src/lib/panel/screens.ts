import { ClockIcon, HouseIcon, TagIcon, type LucideIcon } from "lucide-react";

export interface Screen {
  href: string;
  /** Nombre en el menú y título del encabezado. */
  label: string;
  /** Bajada de una línea: dice qué es la pantalla. La ayuda de uso va en el cuerpo. */
  subtitle?: string;
  /** El encabezado muestra el nombre del negocio en vez de `label` (Inicio). */
  titleIsBusinessName?: true;
  icon: LucideIcon;
}

// Registro de las pantallas del panel: lo leen el menú y el encabezado, así que cada pantalla
// se define una sola vez. Cada rebanada suma la suya acá.
export const SCREENS: readonly Screen[] = [
  { href: "/panel", label: "Inicio", titleIsBusinessName: true, icon: HouseIcon },
  {
    href: "/panel/horarios",
    label: "Horarios",
    subtitle: "Prendé los días en que atendés y poné las horas.",
    icon: ClockIcon,
  },
  {
    href: "/panel/servicios",
    label: "Servicios",
    subtitle: "Lo que ofrecés, cuánto dura y cuánto cuesta.",
    icon: TagIcon,
  },
];

// La pantalla de una ruta: la exacta, o la de la que cuelga (/panel/servicios/123). El prefijo
// tiene que ser un segmento entero, y /panel no cuenta como prefijo de las demás.
export function findScreen(pathname: string): Screen | undefined {
  return SCREENS.find(
    ({ href }) => pathname === href || (href !== "/panel" && pathname.startsWith(`${href}/`))
  );
}
