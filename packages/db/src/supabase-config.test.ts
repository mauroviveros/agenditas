import { describe, expect, test } from "vitest";
import { readSupabaseConfig } from "./supabase-config";

const NAMES = { url: "APP_URL", publishableKey: "APP_KEY" };
const VALID_URL = "http://127.0.0.1:54321";
const VALID_KEY = "sb_publishable_abc123";

describe("readSupabaseConfig", () => {
  test("returns the url and the publishable key under the given names", () => {
    const config = readSupabaseConfig(
      { APP_URL: VALID_URL, APP_KEY: VALID_KEY },
      NAMES,
    );

    expect(config).toEqual({ url: VALID_URL, publishableKey: VALID_KEY });
  });

  test("names every missing variable in the error", () => {
    expect(() => readSupabaseConfig({}, NAMES)).toThrow(/APP_URL.*APP_KEY/);
  });

  test("rejects a url that is not http or https", () => {
    expect(() =>
      readSupabaseConfig(
        { APP_URL: "javascript:alert(1)", APP_KEY: VALID_KEY },
        NAMES,
      ),
    ).toThrow(/APP_URL/);
  });

  test("refuses a secret key because the bundle may be public", () => {
    expect(() =>
      readSupabaseConfig(
        { APP_URL: VALID_URL, APP_KEY: "sb_secret_abc123" },
        NAMES,
      ),
    ).toThrow(/secret/i);
  });

  test("accepts an env object without an index signature", () => {
    interface TypedEnv {
      APP_URL: string;
      APP_KEY: string;
    }
    const env: TypedEnv = { APP_URL: VALID_URL, APP_KEY: VALID_KEY };

    expect(readSupabaseConfig(env, NAMES).url).toBe(VALID_URL);
  });
});
