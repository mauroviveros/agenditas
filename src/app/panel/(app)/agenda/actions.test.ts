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

const { blockTime, cancelAppointment, createAppointment, moveAppointment, restoreAppointment } = await import("./actions");

const SERVICE_ID = "a0000000-0000-4000-8000-000000000001";
const APPOINTMENT_ID = "b0000000-0000-4000-8000-000000000001";
const newAppointment = {
  service_id: SERVICE_ID,
  client_name: "Lucía",
  client_phone: "+54 9 11 5555-1234",
  day: "2027-03-01",
  time: "14:45",
};
const move = { id: APPOINTMENT_ID, day: "2027-03-02", time: "10:00" };

beforeEach(() => {
  rpc.mockReset();
  getMyBusiness.mockReset();
  revalidatePath.mockReset();
  getMyBusiness.mockResolvedValue({ id: "biz-1", name: "Barbería Tito", slug: "barberia-tito" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("createAppointment", () => {
  test("agenda el turno en el negocio de la sesión, con la hora de Buenos Aires en UTC", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(createAppointment(newAppointment)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("create_appointment", {
      business_id: "biz-1",
      service_id: SERVICE_ID,
      client_name: "Lucía",
      client_phone: "+54 9 11 5555-1234",
      starts_at: "2027-03-01T17:45:00.000Z",
    });
  });

  test("sin teléfono manda null", async () => {
    rpc.mockResolvedValue({ error: null });

    await createAppointment({ ...newAppointment, client_phone: "" });

    expect(rpc).toHaveBeenCalledWith(
      "create_appointment",
      expect.objectContaining({ client_phone: null }),
    );
  });

  test("acepta el teléfono en null, que es como lo manda el formulario cuando no hay", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(createAppointment({ ...newAppointment, client_phone: null })).resolves.toEqual({ ok: true });
  });

  test("el negocio sale de la sesión, no de lo que mande el navegador", async () => {
    rpc.mockResolvedValue({ error: null });

    await createAppointment({ ...newAppointment, business_id: "negocio-ajeno" });

    expect(rpc).toHaveBeenCalledWith(
      "create_appointment",
      expect.objectContaining({ business_id: "biz-1" }),
    );
  });

  test("al guardar, vuelve a leer la agenda", async () => {
    rpc.mockResolvedValue({ error: null });

    await createAppointment(newAppointment);

    expect(revalidatePath).toHaveBeenCalledWith("/panel/agenda");
  });

  test("lo que no cumple el esquema no llega a la base", async () => {
    const result = await createAppointment({ ...newAppointment, time: "14:47" });

    expect(result).toEqual({ ok: false, error: "Poné la hora de a 5 minutos: 14:45 o 14:50." });
    expect(rpc).not.toHaveBeenCalled();
  });

  test("lo que no es un objeto no llega a la base", async () => {
    const result = await createAppointment("lucía");

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin negocio vuelve al panel", async () => {
    getMyBusiness.mockResolvedValue(null);

    await expect(createAppointment(newAppointment)).rejects.toThrow("redirect:/panel");
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(createAppointment(newAppointment)).rejects.toThrow("redirect:/login");
  });

  test.each([
    ["overlap", "Ese horario se acaba de ocupar. Elegí otro."],
    ["invalid_appointment", "Revisá los datos del turno."],
    ["not_business_owner", "No encontramos ese servicio. Quizás lo borraste."],
  ])("traduce %s y no vuelve a leer", async (code, error) => {
    rpc.mockResolvedValue({ error: { message: code } });

    await expect(createAppointment(newAppointment)).resolves.toEqual({ ok: false, error });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "connection refused" } });

    await expect(createAppointment(newAppointment)).resolves.toEqual({
      ok: false,
      error: "No pudimos guardar el turno. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("moveAppointment", () => {
  test("mueve el turno del negocio de la sesión a la hora nueva", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(moveAppointment(move)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("move_appointment", {
      business_id: "biz-1",
      appointment_id: APPOINTMENT_ID,
      starts_at: "2027-03-02T13:00:00.000Z",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/panel/agenda");
  });

  test("un id que no es un uuid no llega a la base", async () => {
    const result = await moveAppointment({ ...move, id: "abc" });

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(moveAppointment(move)).rejects.toThrow("redirect:/login");
  });

  test.each([
    ["overlap", "Ese horario se acaba de ocupar. Elegí otro."],
    ["invalid_appointment", "Revisá los datos del turno."],
    ["not_business_owner", "No encontramos ese turno. Quizás ya lo cancelaste."],
  ])("traduce %s", async (code, error) => {
    rpc.mockResolvedValue({ error: { message: code } });

    await expect(moveAppointment(move)).resolves.toEqual({ ok: false, error });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "connection refused" } });

    await expect(moveAppointment(move)).resolves.toEqual({
      ok: false,
      error: "No pudimos mover el turno. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe.each([
  ["cancelAppointment", cancelAppointment, "cancel_appointment", "No pudimos cancelar el turno. Probá de nuevo."],
  ["restoreAppointment", restoreAppointment, "restore_appointment", "No pudimos deshacer la cancelación. Probá de nuevo."],
])("%s", (_name, action, rpcName, genericError) => {
  test("actúa sobre el turno del negocio de la sesión y vuelve a leer la agenda", async () => {
    rpc.mockResolvedValue({ error: null });

    await expect(action(APPOINTMENT_ID)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith(rpcName, { business_id: "biz-1", appointment_id: APPOINTMENT_ID });
    expect(revalidatePath).toHaveBeenCalledWith("/panel/agenda");
  });

  test("un id que no es un uuid no llega a la base", async () => {
    const result = await action("abc");

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ error: { message: "not_authenticated" } });

    await expect(action(APPOINTMENT_ID)).rejects.toThrow("redirect:/login");
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ error: { message: "connection refused" } });

    await expect(action(APPOINTMENT_ID)).resolves.toEqual({ ok: false, error: genericError });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("cancelAppointment, errores conocidos", () => {
  test("un turno que ya no está se avisa", async () => {
    rpc.mockResolvedValue({ error: { message: "not_business_owner" } });

    await expect(cancelAppointment(APPOINTMENT_ID)).resolves.toEqual({
      ok: false,
      error: "No encontramos ese turno. Quizás ya lo cancelaste.",
    });
  });
});

describe("restoreAppointment, errores conocidos", () => {
  test("si el horario se ocupó mientras tanto, se dice", async () => {
    rpc.mockResolvedValue({ error: { message: "overlap" } });

    await expect(restoreAppointment(APPOINTMENT_ID)).resolves.toEqual({
      ok: false,
      error: "Ese horario se ocupó mientras tanto, no se puede deshacer.",
    });
  });

  test("un turno que ya no está se avisa", async () => {
    rpc.mockResolvedValue({ error: { message: "not_business_owner" } });

    await expect(restoreAppointment(APPOINTMENT_ID)).resolves.toEqual({
      ok: false,
      error: "No encontramos ese turno.",
    });
  });
});

describe("blockTime", () => {
  test("bloquea desde ahora, en el negocio de la sesión, y devuelve el id para poder deshacerlo", async () => {
    vi.useFakeTimers({ now: new Date("2027-03-01T18:10:30.000Z") });
    rpc.mockResolvedValue({ data: APPOINTMENT_ID, error: null });

    await expect(blockTime(30)).resolves.toEqual({ ok: true, id: APPOINTMENT_ID });
    expect(rpc).toHaveBeenCalledWith("block_time", {
      business_id: "biz-1",
      starts_at: "2027-03-01T18:10:30.000Z",
      minutes: 30,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/panel/agenda");
    vi.useRealTimers();
  });

  test.each([0, 4, 481, 30.5, "30", null])("%s minutos no llega a la base", async (minutes) => {
    const result = await blockTime(minutes);

    expect(result.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("sin sesión lleva al login", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "not_authenticated" } });

    await expect(blockTime(30)).rejects.toThrow("redirect:/login");
  });

  test("si pisa un turno, lo dice y no crea nada", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "overlap" } });

    await expect(blockTime(30)).resolves.toEqual({
      ok: false,
      error: "Tenés un turno en ese horario. Movelo o cancelalo primero.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("un error que no esperamos se loguea y se avisa en genérico", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "connection refused" } });

    await expect(blockTime(30)).resolves.toEqual({
      ok: false,
      error: "No pudimos bloquear el horario. Probá de nuevo.",
    });
    expect(console.error).toHaveBeenCalled();
  });
});
