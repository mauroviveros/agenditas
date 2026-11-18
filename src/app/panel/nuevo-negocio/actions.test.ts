import { beforeEach, describe, expect, test, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));

const { checkSlugAvailability } = await import("./actions");

describe("checkSlugAvailability", () => {
  beforeEach(() => {
    rpc.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("un link libre vuelve como disponible", async () => {
    rpc.mockResolvedValue({ data: true, error: null });

    await expect(checkSlugAvailability("barberia-tito")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("is_slug_available", { slug: "barberia-tito" });
  });

  test("un link ocupado vuelve como no disponible", async () => {
    rpc.mockResolvedValue({ data: false, error: null });

    await expect(checkSlugAvailability("barberia-tito")).resolves.toBe(false);
  });

  test("un link con formato inválido no llega a la base", async () => {
    await expect(checkSlugAvailability("Tito_Uñas")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("si la base falla, no afirma nada (null)", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });

    await expect(checkSlugAvailability("barberia-tito")).resolves.toBeNull();
  });
});
