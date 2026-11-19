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

// El título de la pantalla en el encabezado, con una bajada corta opcional debajo. Los
// estilos viven acá: las pantallas solo pasan texto.
export function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { header } = useSlots();
  if (!header) {
    return null;
  }
  return createPortal(
    <div className="flex min-w-0 flex-1 flex-col">
      <h1 className="truncate font-heading text-base font-medium">{title}</h1>
      {subtitle ? (
        <p className="hidden truncate text-sm text-muted-foreground md:block">{subtitle}</p>
      ) : null}
    </div>,
    header
  );
}

// Las acciones de la pantalla (p. ej. «Nuevo servicio»), a la derecha del encabezado. Viven
// en el árbol de quien las pone, así que ven su estado y sus handlers.
export function PanelHeaderActions({ children }: { children: ReactNode }) {
  const { header } = useSlots();
  return header
    ? createPortal(<div className="order-last flex shrink-0 items-center gap-2">{children}</div>, header)
    : null;
}

export function PanelFooter({ children }: { children: ReactNode }) {
  const { footer } = useSlots();
  return footer ? createPortal(children, footer) : null;
}
