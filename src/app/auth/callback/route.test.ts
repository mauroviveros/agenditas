import { beforeEach, describe, expect, test, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

const { GET } = await import("./route");

function callback(query: string) {
  return GET(new Request(`http://localhost:3000/auth/callback${query}`));
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("con un code válido abre la sesión y manda al panel", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callback("?code=abc");

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("http://localhost:3000/panel");
  });

  test("sin code vuelve al login con error", async () => {
    const response = await callback("");

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=callback",
    );
  });

  test("si Google o Supabase rechazan el code vuelve al login con error", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid grant") });

    const response = await callback("?code=vencido");

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=callback",
    );
  });

  test("ignora cualquier destino que venga en la URL", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callback("?code=abc&next=https://malo.example");

    expect(response.headers.get("location")).toBe("http://localhost:3000/panel");
  });
});
