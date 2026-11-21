"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "cn";

// Dos huecos del marco del panel (acciones del encabezado y pie) donde cada pantalla pone lo suyo.
// El contexto guarda los nodos, no el contenido: lo que se pone sigue en el árbol de la
// pantalla, con su estado al día.
interface Slots {
  actions: HTMLElement | null;
  footer: HTMLElement | null;
  setActions: (node: HTMLElement | null) => void;
  setFooter: (node: HTMLElement | null) => void;
}

const SlotsContext = createContext<Slots | null>(null);

function useSlots(): Slots {
  const slots = useContext(SlotsContext);
  if (!slots) {
    throw new Error("Falta <PanelSlotsProvider> arriba en el árbol.");
  }
  return slots;
}

export function PanelSlotsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<HTMLElement | null>(null);
  const [footer, setFooter] = useState<HTMLElement | null>(null);
  return (
    <SlotsContext value={{ actions, footer, setActions, setFooter }}>{children}</SlotsContext>
  );
}

// Donde caen las acciones de la pantalla, a la derecha del encabezado (lo dibuja PanelHeader, en header.tsx).
export function ActionsSlot({ className }: { className?: string }) {
  return <div ref={useSlots().setActions} className={className} />;
}

// Donde caen las acciones de pie (guardar, descartar). Sin nada adentro se oculta (empty:hidden).
// Es un grupo con nombre y no un <footer>: un pie suelto dentro de la pantalla se anunciaría
// como «pie de página» sin nombre, con botones adentro.
export function FooterSlot({ className }: { className?: string }) {
  return <div ref={useSlots().setFooter} role="group" aria-label="Acciones de la pantalla" className={className} />;
}

// Las acciones de la pantalla (p. ej. «Nuevo servicio»), a la derecha del encabezado. Viven
// en el árbol de quien las pone, así que ven su estado y sus handlers.
export function PanelHeaderActions({ children }: { children: ReactNode }) {
  const { actions } = useSlots();
  return actions ? createPortal(children, actions) : null;
}

// Las acciones de pie. Traen su propia caja (borde, fondo y padding) y no el hueco: así una
// pantalla puede esconder la suya según el tamaño (`className="md:hidden"`) sin dejar una
// franja vacía.
export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  const { footer } = useSlots();
  return footer
    ? createPortal(
        <div className={cn("border-t border-border bg-card px-5 py-3 md:px-10", className)}>{children}</div>,
        footer
      )
    : null;
}
