import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HolidaysBody } from "./body";

const TODAY = "2026-11-18";

const render = (holidays: Parameters<typeof HolidaysBody>[0]["holidays"], today = TODAY) =>
  renderToStaticMarkup(<HolidaysBody holidays={holidays} today={today} />);

describe("HolidaysBody", () => {
  test("marca solo los puentes con el Badge «Puente»", () => {
    const html = render([
      { date: "2026-12-07", name: "Puente turístico no laborable", kind: "bridge" },
      { date: "2026-12-08", name: "Inmaculada Concepción", kind: "fixed" },
      { date: "2026-12-25", name: "Navidad", kind: "movable" },
    ]);

    expect(html.match(/>Puente</g)).toHaveLength(1);
  });

  test("marca con «Hoy» solo el feriado de hoy", () => {
    const html = render(
      [
        { date: "2026-11-18", name: "Feriado de hoy", kind: "fixed" },
        { date: "2026-12-08", name: "Inmaculada Concepción", kind: "fixed" },
      ],
      "2026-11-18",
    );

    expect(html.match(/>Hoy</g)).toHaveLength(1);
  });

  test("un puente que cae hoy lleva los dos avisos", () => {
    const html = render([{ date: "2026-11-18", name: "Puente turístico", kind: "bridge" }]);

    expect(html).toContain(">Hoy<");
    expect(html).toContain(">Puente<");
  });

  test("agrega el año a las fechas de otro año y no a las de este", () => {
    const html = render([
      { date: "2026-12-25", name: "Navidad", kind: "fixed" },
      { date: "2027-01-01", name: "Año nuevo", kind: "fixed" },
    ]);

    expect(html).toContain("viernes 25 de diciembre<");
    expect(html).toContain("viernes 1 de enero de 2027");
  });

  test("la lista conserva su rol aunque el CSS le saque las viñetas", () => {
    const html = render([{ date: "2026-12-25", name: "Navidad", kind: "fixed" }]);

    expect(html).toContain('<ul role="list"');
  });
});
