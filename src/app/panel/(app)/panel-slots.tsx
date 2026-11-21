"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";

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

// Donde caen las acciones de la pantalla, a la derecha del encabezado (lo dibuja PanelPage).
export function ActionsSlot({ className }: { className?: string }) {
  return <div ref={useSlots().setActions} className={className} />;
}

// Donde caen las acciones de pie (guardar, descartar). Sin nada adentro se oculta (empty:hidden).
export function FooterSlot({ className }: { className?: string }) {
  return <footer ref={useSlots().setFooter} className={className} />;
}

// Las acciones de la pantalla (p. ej. «Nuevo servicio»), a la derecha del encabezado. Viven
// en el árbol de quien las pone, así que ven su estado y sus handlers.
export function PanelHeaderActions({ children }: { children: ReactNode }) {
  const { actions } = useSlots();
  return actions ? createPortal(children, actions) : null;
}

export function PanelFooter({ children }: { children: ReactNode }) {
  const { footer } = useSlots();
  return footer ? createPortal(children, footer) : null;
}
