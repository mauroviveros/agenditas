import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PanelHeader } from "./header";
import { PanelSlotsProvider } from "./panel-slots";

const navigation = vi.hoisted(() => ({ pathname: "/panel/servicios" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

// renderToStaticMarkup no corre efectos ni portales: lo que sale es lo que el navegador
// recibe antes de hidratar.
const render = () =>
  renderToStaticMarkup(
    <PanelSlotsProvider>
      <SidebarProvider>
        <PanelHeader businessName="Barbería Tito" />
      </SidebarProvider>
    </PanelSlotsProvider>
  );

const headerOf = (html: string) => /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";

beforeEach(() => {
  navigation.pathname = "/panel/servicios";
});

describe("PanelHeader", () => {
  test("el título y la bajada de la ruta están en el HTML inicial, sin hidratar", () => {
    const html = render();

    expect(html).toMatch(/<h1[^>]*>Servicios<\/h1>/);
    expect(html).toContain("Lo que ofrecés, cuánto dura y cuánto cuesta.");
  });

  test("la bajada se ve solo desde md", () => {
    expect(render()).toMatch(/<p[^>]*class="[^"]*hidden[^"]*md:block[^"]*"[^>]*>Lo que ofrecés/);
  });

  test("sin bajada no dibuja un párrafo vacío", () => {
    navigation.pathname = "/panel";

    expect(headerOf(render())).not.toMatch(/<p[\s>]/);
  });

  test("Inicio lleva el nombre del negocio como título", () => {
    navigation.pathname = "/panel";

    expect(render()).toMatch(/<h1[^>]*>Barbería Tito<\/h1>/);
  });

  test("una ruta fuera del registro deja el encabezado sin título", () => {
    navigation.pathname = "/panel/no-existe";
    const header = headerOf(render());

    expect(header).not.toContain("<h1");
    expect(header).toContain("Mostrar u ocultar el menú");
  });
});
