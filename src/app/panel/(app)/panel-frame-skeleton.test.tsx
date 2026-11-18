import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { PanelFrameSkeleton } from "./panel-frame-skeleton";

describe("PanelFrameSkeleton", () => {
  const html = renderToStaticMarkup(<PanelFrameSkeleton />);

  test("dibuja el sidebar y el encabezado, y avisa que está cargando", () => {
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain("<header");
    expect(html).toContain("Cargando tu panel");
  });

  test("deja el contenido vacío: no sabe qué ruta se está cargando", () => {
    const contenido = html.match(/<div data-slot="panel-content"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? null;
    expect(contenido).toBe("");
  });

  test("tiene un solo main (SidebarInset ya es el main de la página)", () => {
    expect(html.match(/<main/g)).toHaveLength(1);
  });
});
