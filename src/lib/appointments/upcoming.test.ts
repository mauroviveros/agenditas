import { describe, expect, test } from "vitest";
import { countByService } from "./upcoming";

describe("countByService", () => {
  test("cuenta los turnos que tiene cada servicio", () => {
    const rows = [{ service_id: "a" }, { service_id: "b" }, { service_id: "a" }];

    expect(countByService(rows)).toEqual({ a: 2, b: 1 });
  });

  test("sin turnos no hay servicios con cuenta", () => {
    expect(countByService([])).toEqual({});
  });

  test("ignora los bloqueos, que no tienen servicio", () => {
    expect(countByService([{ service_id: null }, { service_id: "a" }])).toEqual({ a: 1 });
  });

  test("un id raro como «constructor» se cuenta como cualquier otro", () => {
    expect(countByService([{ service_id: "constructor" }])).toEqual({ constructor: 1 });
  });
});
