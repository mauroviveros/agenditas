import { describe, expect, test } from "vitest";
import { findFreeSlug } from "./slug-search";

describe("findFreeSlug", () => {
  test("returns the slug itself when it is free", async () => {
    const free = await findFreeSlug("barberia-ceibo", async () => true);

    expect(free).toBe("barberia-ceibo");
  });

  test("suggests the first numbered variant that is free", async () => {
    const taken = new Set(["barberia-ceibo", "barberia-ceibo-2"]);

    const free = await findFreeSlug(
      "barberia-ceibo",
      async (slug) => !taken.has(slug),
    );

    expect(free).toBe("barberia-ceibo-3");
  });

  test("gives up with null after a few tries", async () => {
    const free = await findFreeSlug("barberia-ceibo", async () => false);

    expect(free).toBeNull();
  });
});
