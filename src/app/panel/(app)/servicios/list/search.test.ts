import { describe, expect, test } from "vitest";
import { matchesQuery } from "./search";

describe("matchesQuery", () => {
  test("una búsqueda vacía o de solo espacios deja pasar todo", () => {
    expect(matchesQuery("Corte", "")).toBe(true);
    expect(matchesQuery("Corte", "   ")).toBe(true);
  });

  test("busca una parte del nombre, sin importar mayúsculas", () => {
    expect(matchesQuery("Corte y barba", "BARB")).toBe(true);
    expect(matchesQuery("Corte y barba", "corte y")).toBe(true);
  });

  test("ignora los acentos de los dos lados", () => {
    expect(matchesQuery("Tintura de raíz", "raiz")).toBe(true);
    expect(matchesQuery("Tintura de raiz", "RAÍZ")).toBe(true);
  });

  test("ignora los espacios de los bordes de lo que se escribe", () => {
    expect(matchesQuery("Corte", "  corte ")).toBe(true);
  });

  test("no deja pasar lo que no está en el nombre", () => {
    expect(matchesQuery("Corte", "tintura")).toBe(false);
  });
});
