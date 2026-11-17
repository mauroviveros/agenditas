import { describe, expect, test } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  test("joins class names and drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  test("keeps the last of two conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  test("accepts conditional objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
