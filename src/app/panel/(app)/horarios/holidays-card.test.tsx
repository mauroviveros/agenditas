import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HolidaysCard } from "./holidays-card";

const render = (result: Parameters<typeof HolidaysCard>[0]["result"]) =>
  renderToStaticMarkup(<HolidaysCard result={result} />);

describe("HolidaysCard", () => {
  test("lista cada feriado con su fecha en español y su nombre", () => {
    const html = render({
      holidays: [
        { date: "2026-12-08", name: "Día de la Inmaculada Concepción de María", kind: "fixed" },
        { date: "2026-12-25", name: "Navidad", kind: "fixed" },
      ],
    });

    expect(html).toContain("Próximos feriados");
    expect(html).toContain("martes 8 de diciembre");
    expect(html).toContain("Día de la Inmaculada Concepción de María");
    expect(html).toContain("viernes 25 de diciembre");
    expect(html).toContain("Navidad");
  });

  test("marca solo los puentes con el Badge «Puente»", () => {
    const html = render({
      holidays: [
        { date: "2026-12-07", name: "Puente turístico no laborable", kind: "bridge" },
        { date: "2026-12-08", name: "Inmaculada Concepción", kind: "fixed" },
        { date: "2026-12-25", name: "Navidad", kind: "movable" },
      ],
    });

    expect(html.match(/>Puente</g)).toHaveLength(1);
  });

  test("sin feriados cargados lo dice, sin lista", () => {
    const html = render({ holidays: [] });

    expect(html).toContain("No hay feriados cargados.");
    expect(html).not.toContain("<ul");
  });

  test("si falló la lectura avisa como alerta, sin lista", () => {
    const html = render({ failed: true });

    expect(html).toContain('role="alert"');
    expect(html).toContain("No pudimos leer los feriados. Probá de nuevo en un rato.");
    expect(html).not.toContain("<ul");
  });
});
