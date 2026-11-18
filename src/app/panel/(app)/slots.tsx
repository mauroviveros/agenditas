"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";

// Dos huecos del marco del panel (encabezado y pie) donde cada pantalla pone lo suyo.
// El contexto guarda los nodos, no el contenido: lo que se pone sigue en el árbol de la
// pantalla, con su estado al día.
interface Slots {
  header: HTMLElement | null;
  footer: HTMLElement | null;
  setHeader: (node: HTMLElement | null) => void;
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
  const [header, setHeader] = useState<HTMLElement | null>(null);
  const [footer, setFooter] = useState<HTMLElement | null>(null);
  return (
    <SlotsContext value={{ header, footer, setHeader, setFooter }}>{children}</SlotsContext>
  );
}

// Donde cae lo que una pantalla pone en el encabezado (lo dibuja el marco).
export function HeaderSlot({ className }: { className?: string }) {
  return <div ref={useSlots().setHeader} className={className} />;
}

// Donde caen las acciones de la pantalla. Sin nada adentro se oculta (empty:hidden).
export function FooterSlot({ className }: { className?: string }) {
  return <footer ref={useSlots().setFooter} className={className} />;
}

export function PanelHeader({ children }: { children: ReactNode }) {
  const { header } = useSlots();
  return header ? createPortal(children, header) : null;
}

export function PanelFooter({ children }: { children: ReactNode }) {
  const { footer } = useSlots();
  return footer ? createPortal(children, footer) : null;
}
