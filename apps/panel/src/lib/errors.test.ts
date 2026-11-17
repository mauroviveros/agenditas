import { describe, expect, test } from "vitest";
import {
  businessErrorMessage,
  DEFAULT_ERROR,
  signInErrorMessage,
} from "./errors";

describe("businessErrorMessage", () => {
  test.each([
    ["slug_taken", /ya está tomado/],
    ["slug_invalid", /3 a 40/],
    ["name_invalid", /nombre/],
    ["category_invalid", /rubro/],
    ["not_authenticated", /Entrá de nuevo/],
    ["business_already_exists", /Ya tenés un negocio/],
  ])("explains %s in voseo with what to do", (key, expected) => {
    expect(businessErrorMessage({ message: key })).toMatch(expected);
  });

  test("falls back to a generic message for unknown errors", () => {
    expect(businessErrorMessage({ message: "boom: connection reset" })).toBe(
      DEFAULT_ERROR,
    );
  });

  test("falls back when there is no error shape at all", () => {
    expect(businessErrorMessage(undefined)).toBe(DEFAULT_ERROR);
    expect(businessErrorMessage("texto suelto")).toBe(DEFAULT_ERROR);
  });
});

describe("signInErrorMessage", () => {
  test("tells the user to wait when the email limit is hit", () => {
    expect(signInErrorMessage({ code: "over_email_send_rate_limit" })).toMatch(
      /Esperá un minuto/,
    );
  });

  test("asks to check the mail for any other failure", () => {
    expect(signInErrorMessage(new Error("network"))).toMatch(/Revisá el mail/);
  });
});
