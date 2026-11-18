import { afterEach, describe, expect, test, vi } from "vitest";
import { getSupabaseEnv } from "./env";

describe("getSupabaseEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("devuelve la URL y la clave publishable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_x");

    expect(getSupabaseEnv()).toEqual({
      url: "http://127.0.0.1:54321",
      key: "sb_publishable_x",
    });
  });

  test("falla con un mensaje claro si falta una variable", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });
});
