import { describe, expect, test } from "vitest";
import { readSupabaseConfig } from "./env";

const VALID_URL = "http://127.0.0.1:54321";
const VALID_KEY = "sb_publishable_abc123";

describe("readSupabaseConfig", () => {
  test("returns the url and the publishable key", () => {
    const config = readSupabaseConfig({
      VITE_SUPABASE_URL: VALID_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
    });

    expect(config).toEqual({ url: VALID_URL, publishableKey: VALID_KEY });
  });

  test("names every missing variable in the error", () => {
    expect(() => readSupabaseConfig({})).toThrow(
      /VITE_SUPABASE_URL.*VITE_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  test("rejects a url that is not http or https", () => {
    expect(() =>
      readSupabaseConfig({
        VITE_SUPABASE_URL: "javascript:alert(1)",
        VITE_SUPABASE_PUBLISHABLE_KEY: VALID_KEY,
      }),
    ).toThrow(/VITE_SUPABASE_URL/);
  });

  test("refuses a secret key because the browser bundle is public", () => {
    expect(() =>
      readSupabaseConfig({
        VITE_SUPABASE_URL: VALID_URL,
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc123",
      }),
    ).toThrow(/secret/i);
  });
});
