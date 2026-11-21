import { describe, expect, test, vi } from "vitest";
import type { Service } from "@/lib/services/queries";

const getMyServices = vi.hoisted(() => vi.fn<() => Promise<Service[]>>());
const getMyArchivedServices = vi.hoisted(() => vi.fn<() => Promise<Service[]>>());
vi.mock("@/lib/services/queries", () => ({ getMyServices, getMyArchivedServices }));
const getUpcomingCounts = vi.hoisted(() => vi.fn<() => Promise<Record<string, number>>>());
vi.mock("@/lib/appointments/upcoming", () => ({ getUpcomingCounts }));
vi.mock("../../panel-slots", () => ({ PanelHeaderActions: () => null, PanelFooter: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ServicesLoader } from "./index";

describe("ServicesLoader", () => {
  test("le pasa a la vista los servicios que lee", async () => {
    const services = [{ id: "s-1", name: "Corte", duration_minutes: 30, price_cents: 1_500_000 }];
    getMyServices.mockResolvedValue(services);
    getMyArchivedServices.mockResolvedValue([]);
    getUpcomingCounts.mockResolvedValue({});

    const element = await ServicesLoader();

    expect(element.props.services).toEqual(services);
  });

  test("también le pasa cuántos turnos por delante tiene cada servicio", async () => {
    getMyServices.mockResolvedValue([]);
    getMyArchivedServices.mockResolvedValue([]);
    getUpcomingCounts.mockResolvedValue({ "s-1": 2 });

    const element = await ServicesLoader();

    expect(element.props.upcoming).toEqual({ "s-1": 2 });
  });

  test("también le pasa los archivados, para poder restaurarlos", async () => {
    const archived = [{ id: "s-9", name: "Alisado", duration_minutes: 120, price_cents: 3_000_000 }];
    getMyServices.mockResolvedValue([]);
    getUpcomingCounts.mockResolvedValue({});
    getMyArchivedServices.mockResolvedValue(archived);

    const element = await ServicesLoader();

    expect(element.props.archived).toEqual(archived);
  });

  test("si falla la lectura el error sube: nunca se ve como un vacío que invita a cargar el primero", async () => {
    getMyServices.mockRejectedValue(new Error("connection refused"));
    getMyArchivedServices.mockResolvedValue([]);
    getUpcomingCounts.mockResolvedValue({});

    await expect(ServicesLoader()).rejects.toThrow("connection refused");
  });
});
