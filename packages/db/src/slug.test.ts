import { describe, expect, test } from "vitest";
import { slugify, slugWithSuffix } from "./slug";

describe("slugify", () => {
  test("lowercases and drops accents", () => {
    expect(slugify("Barbería Ceibo")).toBe("barberia-ceibo");
  });

  test("turns ñ and punctuation into plain letters and single dashes", () => {
    expect(slugify("  Peluquería   Niño's & Co.  ")).toBe(
      "peluqueria-nino-s-co",
    );
  });

  test("returns an empty string when nothing usable is left", () => {
    expect(slugify("¡¡¡")).toBe("");
  });

  test("cuts at 40 characters without leaving a trailing dash", () => {
    const slug = slugify(`${"a".repeat(39)} bbbb`);

    expect(slug).toBe("a".repeat(39));
    expect(slug.length).toBeLessThanOrEqual(40);
  });
});

describe("slugWithSuffix", () => {
  test("appends -2 to a free-looking slug", () => {
    expect(slugWithSuffix("barberia-ceibo", 2)).toBe("barberia-ceibo-2");
  });

  test("shortens the base so the result still fits in 40 characters", () => {
    const result = slugWithSuffix("a".repeat(40), 12);

    expect(result).toBe(`${"a".repeat(37)}-12`);
    expect(result.length).toBe(40);
  });
});
