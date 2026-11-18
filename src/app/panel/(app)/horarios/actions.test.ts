import { beforeEach, describe, expect, test, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));

const getMyBusiness = vi.fn();
vi.mock("@/lib/session", () => ({ getMyBusiness }));

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

// redirect de Next corta el flujo lanzando; acá lo imitamos para poder esperarlo.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

const { saveHours } = await import("./actions");

const week = [
  { weekday: 1, start_time: "09:00", end_time: "13:00" },
  { weekday: 1, start_time: "15:00", end_time: "19:00" },
];

describe("saveHours", () => {
  beforeEach(() => {
    rpc.mockReset();
    getMyBusiness.mockReset();
    revalidatePath.mockReset();
    getMyBusiness.mockResolvedValue({ id: "biz-1", name: "Barbería Tito", slug: "barberia-tito" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("guarda la semana en el negocio del solista", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(saveHours(week)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("set_business_hours", {
      business_id: "biz-1",
      ranges: week,
    });
  });

  test("al guardar, vuelve a leer la pantalla para que muestre lo guardado", async () => {
    rpc.mockResolvedValue({ error: null });

    await saveHours(week);

    expect(revalidatePath).toHaveBeenCalledWith("/panel/horarios");
  });

  test("si guardar falla, no se vuelve a leer la pantalla", async () => {
    rpc.mockResolvedValue({ error: { message: "overlap" } });

    await saveHours(week);

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("una semana vacía también se guarda: el negocio no atiende", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(saveHours([])).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("set_business_hours", { business_id: "biz-1", ranges: [] });
  });

  test("datos inválidos vuelven con el aviso y no llegan a la base", async () => {
    const result = await saveHours([{ weekday: 1, start_time: "13:00", end_time: "09:00" }]);

    expect(result).toEqual({ ok: false, error: "El fin tiene que ser después del inicio." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("lo que no es una lista no llega a la base", async () => {
    const result = await saveHours("lunes de 9 a 13");

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin negocio vuelve al panel, que decide a dónde ir", async () => {
    getMyBusiness.mockResolvedValue(null);

    await expect(saveHours(week)).rejects.toThrow("redirect:/panel");
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(saveHours(week)).rejects.toThrow("redirect:/login");
  });

  test("si la base detecta franjas que se pisan, lo avisa", async () => {
    rpc.mockResolvedValue({ error: { message: "overlap" } });

    await expect(saveHours(week)).resolves.toEqual({
      ok: false,
      error: "Hay dos franjas del mismo día que se pisan.",
    });
  });

  test("si la base rechaza el rango, lo avisa", async () => {
    rpc.mockResolvedValue({ error: { message: "invalid_range" } });

    await expect(saveHours(week)).resolves.toEqual({
      ok: false,
      error: "Revisá las franjas: el fin tiene que ser después del inicio.",
    });
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "not_business_owner" } });

    await expect(saveHours(week)).resolves.toEqual({
      ok: false,
      error: "No pudimos guardar tus horarios. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});
