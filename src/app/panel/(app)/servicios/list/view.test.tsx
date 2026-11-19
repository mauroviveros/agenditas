import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import type { Service } from "@/lib/services/queries";
import { MAX_SERVICES } from "@/lib/services/schema";
import { ServicesView } from "./view";

// Sin el marco del panel no hay encabezado donde colgar las acciones: se dibujan en el lugar.
vi.mock("../../panel-slots", () => ({
  PanelHeaderActions: ({ children }: { children: ReactNode }) => children,
}));

const makeServices = (count: number): Service[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `s-${index}`,
    name: `Servicio ${index + 1}`,
    duration_minutes: 30,
    price_cents: 1_000_000,
  }));

const render = (services: Service[]) =>
  renderToStaticMarkup(<ServicesView services={services} />).replace(/ /g, " ");

// Apagado con aria-disabled (no `disabled`) para que se pueda enfocar y se lea el motivo.
const APAGADO = /aria-disabled="true"/;

// El botón de «Nuevo servicio» del encabezado: su etiqueta y si se puede tocar.
const newServiceButton = (html: string) => /<button[^>]*>(?:(?!<\/button>)[\s\S])*Nuevo servicio/.exec(html)?.[0];

describe("ServicesView", () => {
  test("con servicios muestra la tabla y cuántos hay de cuántos", () => {
    const html = render(makeServices(3));

    expect(html).toContain("<table");
    expect(html).toContain("Servicio 1");
    expect(html).toContain("3 servicios");
  });

  test("«Nuevo servicio» se puede tocar", () => {
    const button = newServiceButton(render(makeServices(3)));

    expect(button).toBeDefined();
    expect(button).not.toMatch(APAGADO);
  });

  test("sin servicios muestra el aviso de vacío y cómo cargar el primero, sin tabla", () => {
    const html = render([]);

    expect(html).toContain("Todavía no cargaste servicios");
    expect(html).toContain("Cargar el primero");
    expect(html).not.toContain("<table");
  });

  test("con el máximo deshabilita «Nuevo servicio» y explica por qué", () => {
    const html = render(makeServices(MAX_SERVICES));

    expect(newServiceButton(html)).toMatch(APAGADO);
    expect(html).toContain("Llegaste al máximo de 50 servicios.");
  });

  test("con el máximo el motivo queda vinculado al botón apagado", () => {
    const html = render(makeServices(MAX_SERVICES));

    const id = /<p id="([^"]+)"[^>]*>Llegaste al máximo/.exec(html)?.[1];
    expect(id).toBeDefined();
    expect(newServiceButton(html)).toContain(`aria-describedby="${id}"`);
  });

  test("con uno menos que el máximo todavía se puede crear", () => {
    const html = render(makeServices(MAX_SERVICES - 1));

    expect(newServiceButton(html)).not.toMatch(APAGADO);
    expect(html).not.toContain("Llegaste al máximo");
  });

  test("el formulario no aparece hasta que se pide", () => {
    expect(render(makeServices(3))).not.toContain('role="dialog"');
  });
});
