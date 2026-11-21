import { describe, expect, test } from "vitest";
import { startsAtOf } from "./day";
import { appointmentSchema, moveSchema } from "./schema";

const SERVICE_ID = "a0000000-0000-4000-8000-000000000001";
const valid = {
  service_id: SERVICE_ID,
  client_name: "Lucía",
  client_phone: "+54 9 11 5555-1234",
  day: "2027-03-01",
  time: "14:45",
};
const messageOf = (input: unknown) => {
  const result = appointmentSchema.safeParse(input);
  return result.success ? null : result.error.issues[0]?.message;
};

describe("appointmentSchema", () => {
  test("acepta un turno completo", () => {
    expect(appointmentSchema.parse(valid)).toEqual(valid);
  });

  test("recorta los espacios del cliente y del teléfono", () => {
    const parsed = appointmentSchema.parse({ ...valid, client_name: "  Lucía  ", client_phone: " 1155 " });

    expect(parsed).toMatchObject({ client_name: "Lucía", client_phone: "1155" });
  });

  test("el teléfono es opcional: vacío o ausente queda en null", () => {
    expect(appointmentSchema.parse({ ...valid, client_phone: "  " }).client_phone).toBeNull();
    expect(appointmentSchema.parse({ ...valid, client_phone: undefined }).client_phone).toBeNull();
  });

  test("el teléfono ya en null (lo que sale del esquema) vuelve a entrar", () => {
    expect(appointmentSchema.parse({ ...valid, client_phone: null }).client_phone).toBeNull();
  });

  test.each([
    ["un servicio que no es un uuid", { service_id: "abc" }, "Elegí un servicio."],
    ["sin servicio", { service_id: undefined }, "Elegí un servicio."],
    ["un cliente vacío", { client_name: "   " }, "Poné el nombre del cliente."],
    ["un cliente de más de 80 caracteres", { client_name: "a".repeat(81) }, "El nombre tiene hasta 80 caracteres."],
    ["un teléfono de más de 30 caracteres", { client_phone: "1".repeat(31) }, "El teléfono tiene hasta 30 caracteres."],
    ["un día que no existe", { day: "2027-02-30" }, "Elegí un día."],
    ["una hora mal escrita", { time: "2:45pm" }, "Poné la hora como HH:mm, por ejemplo 14:45."],
    ["una hora que no existe", { time: "25:00" }, "Poné la hora como HH:mm, por ejemplo 14:45."],
    ["una hora que no es de a 5 minutos", { time: "14:47" }, "Poné la hora de a 5 minutos: 14:45 o 14:50."],
  ])("rechaza %s", (_caso, change, message) => {
    expect(messageOf({ ...valid, ...change })).toBe(message);
  });

  test("lo que no es un objeto se rechaza", () => {
    expect(messageOf("lucía")).not.toBeNull();
  });
});

describe("moveSchema", () => {
  test("acepta un turno, un día y una hora", () => {
    expect(moveSchema.parse({ id: SERVICE_ID, day: "2027-03-01", time: "10:00" })).toEqual({
      id: SERVICE_ID,
      day: "2027-03-01",
      time: "10:00",
    });
  });

  test("rechaza un turno que no es un uuid", () => {
    expect(moveSchema.safeParse({ id: "x", day: "2027-03-01", time: "10:00" }).success).toBe(false);
  });

  test("rechaza una hora fuera de los pasos de 5", () => {
    expect(moveSchema.safeParse({ id: SERVICE_ID, day: "2027-03-01", time: "10:03" }).success).toBe(false);
  });
});

describe("startsAtOf", () => {
  test("pasa el día y la hora de Buenos Aires al instante UTC", () => {
    expect(startsAtOf("2027-03-01", "14:45")).toBe("2027-03-01T17:45:00.000Z");
  });

  test("pasada la medianoche UTC, cambia el día", () => {
    expect(startsAtOf("2027-03-01", "22:30")).toBe("2027-03-02T01:30:00.000Z");
  });
});
