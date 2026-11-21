import { beforeEach, describe, expect, test, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ rpc }),
}));

const getMyBusiness = vi.fn();
vi.mock("@/lib/business/queries", () => ({ getMyBusiness }));

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

// redirect de Next corta el flujo lanzando; acá lo imitamos para poder esperarlo.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

const { deleteService, restoreService, saveService } = await import("./actions");

const SERVICE_ID = "a0000000-0000-4000-8000-000000000001";
const newService = { name: "Corte", duration_minutes: 30, price_cents: 1_500_000 };

beforeEach(() => {
  rpc.mockReset();
  getMyBusiness.mockReset();
  revalidatePath.mockReset();
  getMyBusiness.mockResolvedValue({ id: "biz-1", name: "Barbería Tito", slug: "barberia-tito" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("saveService", () => {
  test("crea un servicio en el negocio de la sesión", async () => {
    rpc.mockResolvedValue({ data: SERVICE_ID, error: null });

    await expect(saveService(newService)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("save_service", {
      business_id: "biz-1",
      service_id: null,
      name: "Corte",
      duration_minutes: 30,
      price_cents: 1_500_000,
    });
  });

  test("edita: el id llega a la base como service_id", async () => {
    rpc.mockResolvedValue({ data: SERVICE_ID, error: null });

    await saveService({ ...newService, id: SERVICE_ID });

    expect(rpc).toHaveBeenCalledWith(
      "save_service",
      expect.objectContaining({ business_id: "biz-1", service_id: SERVICE_ID }),
    );
  });

  test("el negocio sale de la sesión, no de lo que mande el navegador", async () => {
    rpc.mockResolvedValue({ data: SERVICE_ID, error: null });

    await saveService({ ...newService, business_id: "negocio-ajeno" });

    expect(rpc).toHaveBeenCalledWith(
      "save_service",
      expect.objectContaining({ business_id: "biz-1" }),
    );
  });

  test("el nombre viaja sin espacios en los bordes", async () => {
    rpc.mockResolvedValue({ data: SERVICE_ID, error: null });

    await saveService({ ...newService, name: "  Corte  " });

    expect(rpc).toHaveBeenCalledWith("save_service", expect.objectContaining({ name: "Corte" }));
  });

  test("al guardar, vuelve a leer la pantalla para que muestre lo guardado", async () => {
    rpc.mockResolvedValue({ data: SERVICE_ID, error: null });

    await saveService(newService);

    expect(revalidatePath).toHaveBeenCalledWith("/panel/servicios");
  });

  test("si guardar falla, no se vuelve a leer la pantalla", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "duplicate_name" } });

    await saveService(newService);

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("datos inválidos vuelven con el aviso y no llegan a la base", async () => {
    const result = await saveService({ ...newService, duration_minutes: 32 });

    expect(result).toEqual({ ok: false, error: "La duración va de a 5 minutos." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("un servicio sin precio no llega a la base", async () => {
    const result = await saveService({ name: "Corte", duration_minutes: 30 });

    expect(result).toEqual({ ok: false, error: "Poné el precio." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("lo que no es un objeto no llega a la base", async () => {
    const result = await saveService("corte de pelo");

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin negocio vuelve al panel, que decide a dónde ir", async () => {
    getMyBusiness.mockResolvedValue(null);

    await expect(saveService(newService)).rejects.toThrow("redirect:/panel");
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "not_authenticated" } });

    await expect(saveService(newService)).rejects.toThrow("redirect:/login");
  });

  test.each([
    ["duplicate_name", "Ya tenés un servicio con ese nombre."],
    ["service_limit", "Llegaste al máximo de 50 servicios."],
    ["invalid_service", "Revisá los datos del servicio."],
    ["not_business_owner", "No encontramos ese servicio."],
  ])("si la base responde %s, lo avisa", async (code, error) => {
    rpc.mockResolvedValue({ data: null, error: { message: code } });

    await expect(saveService(newService)).resolves.toEqual({ ok: false, error });
  });

  test("un error que no esperamos se loguea y se avisa en genérico, sin filtrar el texto", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'insert or update on table "services" violates foreign key' },
    });

    const result = await saveService(newService);

    expect(result).toEqual({
      ok: false,
      error: "No pudimos guardar el servicio. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("deleteService", () => {
  test("borra el servicio del negocio de la sesión", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(deleteService(SERVICE_ID)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("delete_service", {
      business_id: "biz-1",
      service_id: SERVICE_ID,
    });
  });

  test("al borrar, vuelve a leer la pantalla", async () => {
    rpc.mockResolvedValue({ error: null });

    await deleteService(SERVICE_ID);

    expect(revalidatePath).toHaveBeenCalledWith("/panel/servicios");
  });

  test("un id que no es un uuid no llega a la base", async () => {
    const result = await deleteService("abc");

    expect(result).toEqual({ ok: false, error: "No encontramos ese servicio." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("lo que no es un texto no llega a la base", async () => {
    const result = await deleteService({ id: SERVICE_ID });

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin negocio vuelve al panel", async () => {
    getMyBusiness.mockResolvedValue(null);

    await expect(deleteService(SERVICE_ID)).rejects.toThrow("redirect:/panel");
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(deleteService(SERVICE_ID)).rejects.toThrow("redirect:/login");
  });

  test("si el servicio ya no existe o no es suyo, lo avisa y no vuelve a leer", async () => {
    rpc.mockResolvedValue({ error: { message: "not_business_owner" } });

    await expect(deleteService(SERVICE_ID)).resolves.toEqual({
      ok: false,
      error: "No encontramos ese servicio. Quizás ya lo borraste.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "connection refused" } });

    await expect(deleteService(SERVICE_ID)).resolves.toEqual({
      ok: false,
      error: "No pudimos borrar el servicio. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("restoreService", () => {
  test("restaura el servicio del negocio de la sesión y vuelve a leer la pantalla", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(restoreService(SERVICE_ID)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("restore_service", {
      business_id: "biz-1",
      service_id: SERVICE_ID,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/panel/servicios");
  });

  test("un id que no es un uuid no llega a la base", async () => {
    const result = await restoreService("abc");

    expect(result).toEqual({ ok: false, error: "No encontramos ese servicio." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin negocio vuelve al panel", async () => {
    getMyBusiness.mockResolvedValue(null);

    await expect(restoreService(SERVICE_ID)).rejects.toThrow("redirect:/panel");
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(restoreService(SERVICE_ID)).rejects.toThrow("redirect:/login");
  });

  test.each([
    ["duplicate_name", "Ya tenés un servicio con ese nombre."],
    ["service_limit", "Llegaste al máximo de 50 servicios."],
    ["not_business_owner", "No encontramos ese servicio."],
  ])("traduce %s", async (code, error) => {
    rpc.mockResolvedValue({ error: { message: code } });

    await expect(restoreService(SERVICE_ID)).resolves.toEqual({ ok: false, error });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "connection refused" } });

    await expect(restoreService(SERVICE_ID)).resolves.toEqual({
      ok: false,
      error: "No pudimos deshacer el borrado. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});
