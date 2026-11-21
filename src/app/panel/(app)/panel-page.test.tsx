import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PanelPage } from "./panel-page";
import { PanelSlotsProvider } from "./panel-slots";

// renderToStaticMarkup no corre efectos ni portales: lo que sale es lo que el navegador
// recibe antes de hidratar.
const render = (props: { title: string; subtitle?: string }) =>
  renderToStaticMarkup(
    <PanelSlotsProvider>
      <SidebarProvider>
        <PanelPage {...props}>
          <p>contenido</p>
        </PanelPage>
      </SidebarProvider>
    </PanelSlotsProvider>
  );

describe("PanelPage", () => {
  test("el título y la bajada están en el HTML inicial, sin hidratar", () => {
    const html = render({ title: "Servicios", subtitle: "Lo que ofrecés." });

    expect(html).toMatch(/<h1[^>]*>Servicios<\/h1>/);
    expect(html).toContain("Lo que ofrecés.");
  });

  test("la bajada se ve solo desde md", () => {
    const html = render({ title: "Servicios", subtitle: "Lo que ofrecés." });

    expect(html).toMatch(/<p[^>]*class="[^"]*hidden[^"]*md:block[^"]*"[^>]*>Lo que ofrecés\./);
  });

  test("sin bajada no dibuja un párrafo vacío", () => {
    const html = render({ title: "Inicio" });

    const header = /<header[\s\S]*?<\/header>/.exec(html)?.[0];

    expect(header).toBeDefined();
    expect(header).not.toMatch(/<p[\s>]/);
  });

  test("el botón del menú y el contenido van en el mismo marco", () => {
    const html = render({ title: "Servicios" });

    expect(html).toContain("Mostrar u ocultar el menú");
    expect(html).toMatch(/<main[^>]*data-slot="panel-content"[^>]*>[\s\S]*contenido/);
  });
});
