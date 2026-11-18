import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HolidaysBody } from "./body";

const render = (holidays: Parameters<typeof HolidaysBody>[0]["holidays"]) =>
  renderToStaticMarkup(<HolidaysBody holidays={holidays} />);

describe("HolidaysBody", () => {
  test("marca solo los puentes con el Badge «Puente»", () => {
    const html = render([
      { date: "2026-12-07", name: "Puente turístico no laborable", kind: "bridge" },
      { date: "2026-12-08", name: "Inmaculada Concepción", kind: "fixed" },
      { date: "2026-12-25", name: "Navidad", kind: "movable" },
    ]);

    expect(html.match(/>Puente</g)).toHaveLength(1);
  });
});
