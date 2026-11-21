import { describe, expect, test } from "vitest";
import { findScreen, SCREENS } from "./screens";

describe("findScreen", () => {
  test("encuentra la pantalla por su ruta exacta", () => {
    expect(findScreen("/panel/servicios")?.label).toBe("Servicios");
  });

  test("encuentra la agenda", () => {
    expect(findScreen("/panel/agenda")?.label).toBe("Agenda");
  });

  test("Inicio es /panel y no se come a las demás por ser prefijo", () => {
    expect(findScreen("/panel")?.label).toBe("Inicio");
    expect(findScreen("/panel/horarios")?.label).toBe("Horarios");
  });

  test("una ruta anidada cae en la pantalla de la que cuelga", () => {
    expect(findScreen("/panel/servicios/123")?.label).toBe("Servicios");
  });

  test("un prefijo que no es un segmento completo no cuenta", () => {
    expect(findScreen("/panel/servicios-viejos")).toBeUndefined();
  });

  test("una ruta que no está en el registro no devuelve nada", () => {
    expect(findScreen("/panel/no-existe")).toBeUndefined();
  });
});

describe("SCREENS", () => {
  test("cada ruta aparece una sola vez", () => {
    const hrefs = SCREENS.map((screen) => screen.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test("solo Inicio muestra el nombre del negocio como título", () => {
    const withBusinessName = SCREENS.filter((screen) => screen.titleIsBusinessName);

    expect(withBusinessName.map((screen) => screen.href)).toEqual(["/panel"]);
  });
});
