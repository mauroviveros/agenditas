import { describe, expect, test } from "vitest";
import { type AppointmentRow, parseAgenda } from "./parse";

const appointment: AppointmentRow = {
  id: "t1",
  kind: "appointment",
  service_name: "Corte",
  service_price_cents: 1_500_000,
  client_name: "Lucía",
  client_phone: "+54 9 11 5555-1234",
  starts_at: "2027-03-01T13:00:00+00:00",
  ends_at: "2027-03-01T13:30:00+00:00",
};
const block: AppointmentRow = {
  id: "b1",
  kind: "block",
  service_name: null,
  service_price_cents: null,
  client_name: null,
  client_phone: null,
  starts_at: "2027-03-01T15:00:00+00:00",
  ends_at: "2027-03-01T15:30:00+00:00",
};

describe("parseAgenda", () => {
  test("un día sin filas es una agenda vacía", () => {
    expect(parseAgenda([])).toEqual([]);
  });

  test("un turno trae servicio, precio y cliente", () => {
    expect(parseAgenda([appointment])).toEqual([
      {
        kind: "appointment",
        id: "t1",
        startsAt: "2027-03-01T13:00:00+00:00",
        endsAt: "2027-03-01T13:30:00+00:00",
        serviceName: "Corte",
        priceCents: 1_500_000,
        clientName: "Lucía",
        clientPhone: "+54 9 11 5555-1234",
      },
    ]);
  });

  test("un bloqueo trae solo el horario", () => {
    expect(parseAgenda([block])).toEqual([
      {
        kind: "block",
        id: "b1",
        startsAt: "2027-03-01T15:00:00+00:00",
        endsAt: "2027-03-01T15:30:00+00:00",
      },
    ]);
  });

  test("el teléfono es opcional", () => {
    const [item] = parseAgenda([{ ...appointment, client_phone: null }]);

    expect(item).toMatchObject({ kind: "appointment", clientPhone: null });
  });

  test("conserva el orden en que llegan", () => {
    const items = parseAgenda([appointment, block]);

    expect(items.map(({ id }) => id)).toEqual(["t1", "b1"]);
  });

  test("un turno al que le falta el cliente es un dato roto y no se esconde", () => {
    expect(() => parseAgenda([{ ...appointment, client_name: null }])).toThrow(/t1/);
  });

  test("un turno al que le falta el servicio también", () => {
    expect(() => parseAgenda([{ ...appointment, service_name: null }])).toThrow(/t1/);
  });
});
