import { describe, expect, test } from "vitest";
import { businessSchema, slugBaseForSuffix, slugify } from "./business";

describe("slugify", () => {
  test("pasa el nombre a minúsculas con guiones", () => {
    expect(slugify("Barbería Tito")).toBe("barberia-tito");
  });

  test("saca tildes, la ñ y los símbolos", () => {
    expect(slugify("Uñas & Pestañas de Ña Rosa!")).toBe("unas-pestanas-de-na-rosa");
  });

  test("no deja guiones dobles ni en las puntas", () => {
    expect(slugify("  --Tattoo   Studio--  ")).toBe("tattoo-studio");
  });

  test("corta en 40 caracteres sin terminar en guion", () => {
    const slug = slugify("Centro de entrenamiento funcional del barrio de Palermo");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("slugBaseForSuffix", () => {
  test("deja igual una base corta", () => {
    expect(slugBaseForSuffix("barberia-tito")).toBe("barberia-tito");
  });

  test("recorta una base larga para que quepa un sufijo de 12 letras con su guion", () => {
    const base = slugify("Centro de entrenamiento funcional del barrio de Palermo Soho");
    const recortada = slugBaseForSuffix(base);
    expect(`${recortada}-${"x".repeat(12)}`.length).toBeLessThanOrEqual(40);
    expect(recortada.endsWith("-")).toBe(false);
    expect(base.startsWith(recortada)).toBe(true);
  });
});

describe("businessSchema", () => {
  test("acepta un negocio válido y recorta espacios del nombre", () => {
    const result = businessSchema.safeParse({ name: "  Barbería Tito ", slug: "barberia-tito" });

    expect(result.success && result.data).toEqual({ name: "Barbería Tito", slug: "barberia-tito" });
  });

  test("rechaza un nombre de menos de 2 caracteres", () => {
    const result = businessSchema.safeParse({ name: " A ", slug: "barberia-tito" });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toBeDefined();
  });

  test("rechaza un slug con mayúsculas, guion bajo o eñe", () => {
    const result = businessSchema.safeParse({ name: "Tito", slug: "Tito_Uñas" });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.slug).toBeDefined();
  });

  test("rechaza un slug que empieza con guion o es muy corto", () => {
    expect(businessSchema.safeParse({ name: "Tito", slug: "-tito" }).success).toBe(false);
    expect(businessSchema.safeParse({ name: "Tito", slug: "ab" }).success).toBe(false);
  });
});
