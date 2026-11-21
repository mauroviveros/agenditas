import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import ScreenError from "./error";

const render = () =>
  renderToStaticMarkup(<ScreenError error={new Error("connection refused")} retry={() => {}} />);

describe("ScreenError", () => {
  test("avisa con texto e ícono, como alerta, y deja probar de nuevo", () => {
    const html = render();

    expect(html).toContain('role="alert"');
    expect(html).toContain("No pudimos cargar esta pantalla");
    expect(html).toMatch(/<button[^>]*>Probá de nuevo<\/button>/);
    expect(html).toContain("<svg");
  });

  test("el detalle del error no llega a la pantalla", () => {
    expect(render()).not.toContain("connection refused");
  });
});
