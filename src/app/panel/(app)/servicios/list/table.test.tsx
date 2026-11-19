import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { Service } from "@/lib/services/queries";
import { ServicesTable } from "./table";

const services: Service[] = [
  { id: "s-1", name: "Corte", duration_minutes: 30, price_cents: 1_500_000 },
  { id: "s-2", name: "Corte y barba", duration_minutes: 45, price_cents: 2_200_050 },
  { id: "s-3", name: "Perfilado de cejas", duration_minutes: 15, price_cents: 0 },
  { id: "s-4", name: "Alisado", duration_minutes: 120, price_cents: 8_500_000 },
];

const manyServices = (count: number): Service[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m-${index}`,
    name: `Servicio ${index + 1}`,
    duration_minutes: 30,
    price_cents: 1_000_000,
  }));

// Intl separa el $ del número con un espacio duro.
const render = (selectedId: string | null = null, list: Service[] = services) =>
  renderToStaticMarkup(
    <ServicesTable services={list} selectedId={selectedId} onSelect={() => {}} />,
  ).replace(/\u00a0/g, " ");

describe("ServicesTable", () => {
  test("la tabla tiene las tres columnas, todas ordenables y sin orden al empezar", () => {
    const html = render();

    for (const name of ["Servicio", "Duración", "Precio"]) {
      expect(html).toMatch(new RegExp(`<th[^>]*aria-sort="none"[^>]*>.*?${name}`));
    }
    expect(html.match(/<th /g)).toHaveLength(3);
  });

  test("muestra duración y precio como se leen: «2 h», «$ 22.000,50», «Sin cargo»", () => {
    const html = render();

    expect(html).toContain(">30 min<");
    expect(html).toContain(">2 h<");
    expect(html).toContain(">$ 15.000<");
    expect(html).toContain(">$ 22.000,50<");
    expect(html).toContain(">Sin cargo<");
  });

  test("cada servicio aparece en la tabla y en la lista de celu", () => {
    const html = render();

    for (const { name } of services) {
      expect(html.split(`>${name}<`)).toHaveLength(3);
    }
  });

  test("los servicios salen en el orden en que llegan", () => {
    const html = render();

    const positions = services.map(({ name }) => html.indexOf(`>${name}<`));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("resalta solo la fila del servicio que se está editando", () => {
    const html = render("s-2");

    expect(html.match(/data-state="selected"/g)).toHaveLength(2);
    expect(html).toMatch(/data-state="selected"[^>]*>(?:(?!<\/tr>|<\/button>)[\s\S])*Corte y barba/);
  });

  test("sin servicio elegido no resalta ninguna fila", () => {
    expect(render()).not.toContain('data-state="selected"');
  });

  test("el nombre es un botón para abrir el servicio", () => {
    const html = render();

    expect(html).toMatch(/<button[^>]*>Corte<\/button>/);
  });

  test("la tabla tiene un título para lectores de pantalla", () => {
    expect(render()).toMatch(/<caption[^>]*sr-only/);
  });

  test("tiene un campo para buscar por nombre", () => {
    expect(render()).toMatch(/<input[^>]*aria-label="Buscar servicio"/);
  });

  test("con pocos servicios dice cuántos son y no muestra la paginación", () => {
    const html = render();

    expect(html).toContain(">4 servicios<");
    expect(html).not.toContain("Anterior");
    expect(html).not.toContain("Siguiente");
  });

  test("con un solo servicio lo dice en singular", () => {
    expect(render(null, manyServices(1))).toContain(">1 servicio<");
  });

  test("pagina de a 10: muestra la primera página y el rango del pie", () => {
    const html = render(null, manyServices(12));

    expect(html.match(/<tr /g)).toHaveLength(11); // el encabezado y 10 filas
    expect(html).toContain(">Servicio 10<");
    expect(html).not.toContain(">Servicio 11<");
    expect(html).toContain(">1–10 de 12 servicios<");
  });

  test("en la primera página «Anterior» está apagado y «Siguiente» no", () => {
    const html = render(null, manyServices(12));
    // El atributo, no la palabra: las clases de Tailwind traen «disabled:».
    const apagado = (texto: string) =>
      new RegExp(`<button[^>]*\\sdisabled(?:=""|\\s|>)[^>]*>(?:(?!</button>)[\\s\\S])*${texto}`);

    expect(html).toMatch(apagado("Anterior"));
    expect(html).not.toMatch(apagado("Siguiente"));
  });
});
