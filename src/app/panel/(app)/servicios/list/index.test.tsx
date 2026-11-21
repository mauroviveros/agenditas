import { describe, expect, test, vi } from "vitest";
import type { Service } from "@/lib/services/queries";

const getMyServices = vi.hoisted(() => vi.fn<() => Promise<Service[]>>());
vi.mock("@/lib/services/queries", () => ({ getMyServices }));
vi.mock("../../panel-slots", () => ({ PanelHeaderActions: () => null, PanelFooter: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ServicesLoader } from "./index";

describe("ServicesLoader", () => {
  test("le pasa a la vista los servicios que lee", async () => {
    const services = [{ id: "s-1", name: "Corte", duration_minutes: 30, price_cents: 1_500_000 }];
    getMyServices.mockResolvedValue(services);

    const element = await ServicesLoader();

    expect(element.props.services).toEqual(services);
  });

  test("si falla la lectura el error sube: nunca se ve como un vacío que invita a cargar el primero", async () => {
    getMyServices.mockRejectedValue(new Error("connection refused"));

    await expect(ServicesLoader()).rejects.toThrow("connection refused");
  });
});
