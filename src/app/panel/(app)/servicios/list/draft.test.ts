import { describe, expect, test } from "vitest";
import type { Service } from "@/lib/services/queries";
import { DURATION_PRESETS, draftFrom, parseDraft } from "./draft";

const SERVICE_ID = "a0000000-0000-4000-8000-000000000001";
const corte: Service = { id: SERVICE_ID, name: "Corte", duration_minutes: 30, price_cents: 1_500_000 };

describe("draftFrom", () => {
  test("un servicio nuevo arranca vacío, sin duración elegida", () => {
    expect(draftFrom()).toEqual({ name: "", preset: null, otherMinutes: "", price: "" });
  });

  test("un servicio existente trae sus datos, con el precio como se escribe", () => {
    expect(draftFrom(corte)).toEqual({ name: "Corte", preset: 30, otherMinutes: "", price: "15000" });
  });

  test("los centavos van con coma", () => {
    expect(draftFrom({ ...corte, price_cents: 2_200_050 }).price).toBe("22000,50");
  });

  test("una duración que no es una de las chips abre «Otra» con ese valor", () => {
    expect(draftFrom({ ...corte, duration_minutes: 35 })).toMatchObject({
      preset: "other",
      otherMinutes: "35",
    });
  });

  test("todas las chips son duraciones válidas del esquema", () => {
    for (const minutes of DURATION_PRESETS) {
      expect(minutes % 5).toBe(0);
      expect(minutes).toBeGreaterThanOrEqual(5);
      expect(minutes).toBeLessThanOrEqual(480);
    }
  });
});

describe("parseDraft", () => {
  const valid = { name: "Corte", preset: 30 as const, otherMinutes: "", price: "15000" };

  test("un borrador completo da lo que se manda a guardar", () => {
    expect(parseDraft(valid)).toEqual({
      ok: true,
      data: { name: "Corte", duration_minutes: 30, price_cents: 1_500_000 },
    });
  });

  test("al editar suma el id del servicio", () => {
    const parsed = parseDraft(valid, SERVICE_ID);

    expect(parsed).toMatchObject({ ok: true, data: { id: SERVICE_ID } });
  });

  test("el nombre viaja sin espacios en los bordes", () => {
    const parsed = parseDraft({ ...valid, name: "  Corte largo " });

    expect(parsed).toMatchObject({ ok: true, data: { name: "Corte largo" } });
  });

  test("«Otra» usa los minutos escritos", () => {
    const parsed = parseDraft({ ...valid, preset: "other", otherMinutes: "95" });

    expect(parsed).toMatchObject({ ok: true, data: { duration_minutes: 95 } });
  });

  test("acepta el precio con puntos de miles y coma", () => {
    const parsed = parseDraft({ ...valid, price: "1.500,50" });

    expect(parsed).toMatchObject({ ok: true, data: { price_cents: 150_050 } });
  });

  test("el precio 0 vale: es un servicio sin cargo", () => {
    expect(parseDraft({ ...valid, price: "0" })).toMatchObject({ ok: true });
  });

  test("sin nombre avisa en el nombre", () => {
    expect(parseDraft({ ...valid, name: "   " })).toEqual({
      ok: false,
      errors: { name: "Poné un nombre." },
    });
  });

  test("sin duración elegida avisa en la duración", () => {
    expect(parseDraft({ ...valid, preset: null })).toEqual({
      ok: false,
      errors: { duration: "Elegí cuánto dura." },
    });
  });

  test("«Otra» vacía o con una duración que no va, avisa en la duración", () => {
    expect(parseDraft({ ...valid, preset: "other", otherMinutes: "" })).toMatchObject({
      ok: false,
      errors: { duration: "Poné cuántos minutos dura." },
    });
    expect(parseDraft({ ...valid, preset: "other", otherMinutes: "32" })).toMatchObject({
      ok: false,
      errors: { duration: "La duración va de a 5 minutos." },
    });
    expect(parseDraft({ ...valid, preset: "other", otherMinutes: "500" })).toMatchObject({
      ok: false,
      errors: { duration: "Dura hasta 480 minutos." },
    });
  });

  test("un precio que no se entiende avisa cómo escribirlo", () => {
    for (const price of ["", "abc", "1500.50", "1,500"]) {
      expect(parseDraft({ ...valid, price })).toMatchObject({
        ok: false,
        errors: { price: "Poné el precio así: 1500 o 1.500,50." },
      });
    }
  });

  test("un precio de más del tope avisa en el precio", () => {
    expect(parseDraft({ ...valid, price: "10.000.001" })).toMatchObject({
      ok: false,
      errors: { price: "El precio puede ser de hasta $ 10.000.000." },
    });
  });

  test("avisa de todos los campos a la vez", () => {
    const parsed = parseDraft({ name: "", preset: null, otherMinutes: "", price: "" });

    expect(parsed).toEqual({
      ok: false,
      errors: {
        name: "Poné un nombre.",
        duration: "Elegí cuánto dura.",
        price: "Poné el precio así: 1500 o 1.500,50.",
      },
    });
  });
});
