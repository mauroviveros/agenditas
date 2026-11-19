import { describe, expect, test } from "vitest";
import {
  MAX_PRICE_CENTS,
  formatDuration,
  formatPesos,
  formatPrice,
  parsePesos,
  pesosInputValue,
  serviceSchema,
} from "./schema";

const valid = { name: "Corte", duration_minutes: 30, price_cents: 1_500_000 };

describe("serviceSchema", () => {
  test("acepta un servicio completo", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });

  test("acepta el id de un servicio que se edita", () => {
    const id = "a0000000-0000-4000-8000-000000000001";

    const parsed = serviceSchema.parse({ ...valid, id });

    expect(parsed.id).toBe(id);
  });

  test("rechaza un id que no es un uuid", () => {
    expect(serviceSchema.safeParse({ ...valid, id: "abc" }).success).toBe(false);
  });

  test("no deja pasar el negocio: sale de la sesión, no de lo que mande el navegador", () => {
    const parsed = serviceSchema.parse({ ...valid, business_id: "otro-negocio" });

    expect(parsed).not.toHaveProperty("business_id");
  });

  describe("nombre", () => {
    test("se guarda sin espacios en los bordes", () => {
      expect(serviceSchema.parse({ ...valid, name: "  Corte largo " }).name).toBe(
        "Corte largo",
      );
    });

    test("rechaza uno vacío o de puros espacios", () => {
      expect(serviceSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
      expect(serviceSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
    });

    test("acepta 60 caracteres y rechaza 61", () => {
      expect(serviceSchema.safeParse({ ...valid, name: "a".repeat(60) }).success).toBe(true);
      expect(serviceSchema.safeParse({ ...valid, name: "a".repeat(61) }).success).toBe(false);
    });
  });

  describe("duración", () => {
    test.each([5, 30, 480])("acepta %i minutos", (duration_minutes) => {
      expect(serviceSchema.safeParse({ ...valid, duration_minutes }).success).toBe(true);
    });

    test.each([0, 4, 7, 485, 30.5, -5])("rechaza %s minutos", (duration_minutes) => {
      expect(serviceSchema.safeParse({ ...valid, duration_minutes }).success).toBe(false);
    });

    test("rechaza texto y falta de dato", () => {
      expect(serviceSchema.safeParse({ ...valid, duration_minutes: "30" }).success).toBe(false);
      expect(
        serviceSchema.safeParse({ name: "Corte", price_cents: 100 }).success,
      ).toBe(false);
    });
  });

  describe("precio", () => {
    test("acepta $0 (sin cargo) y el tope de $10.000.000", () => {
      expect(serviceSchema.safeParse({ ...valid, price_cents: 0 }).success).toBe(true);
      expect(
        serviceSchema.safeParse({ ...valid, price_cents: MAX_PRICE_CENTS }).success,
      ).toBe(true);
    });

    test("rechaza uno de más del tope, negativo o con decimales", () => {
      expect(
        serviceSchema.safeParse({ ...valid, price_cents: MAX_PRICE_CENTS + 1 }).success,
      ).toBe(false);
      expect(serviceSchema.safeParse({ ...valid, price_cents: -1 }).success).toBe(false);
      expect(serviceSchema.safeParse({ ...valid, price_cents: 10.5 }).success).toBe(false);
    });

    test("es obligatorio", () => {
      expect(
        serviceSchema.safeParse({ name: "Corte", duration_minutes: 30 }).success,
      ).toBe(false);
      expect(serviceSchema.safeParse({ ...valid, price_cents: null }).success).toBe(false);
    });
  });
});

describe("parsePesos", () => {
  test.each([
    ["1500", 150_000],
    ["1.500", 150_000],
    ["1.500,50", 150_050],
    ["1500,5", 150_050],
    ["1500,05", 150_005],
    ["0", 0],
    ["0,99", 99],
    ["$ 1.500", 150_000],
    ["$1.500", 150_000],
    ["$ 1.500", 150_000], // el espacio duro que trae un texto pegado
    ["  1500  ", 150_000],
    ["1.500.000", 150_000_000],
    ["10.000.000", 1_000_000_000],
  ])("%s son %i centavos", (text, cents) => {
    expect(parsePesos(text)).toBe(cents);
  });

  test.each([
    "",
    "   ",
    "abc",
    "-5",
    "1.50", // el punto separa miles, no decimales
    "1500.50", // formato inglés
    "1,500", // más de dos decimales
    "15,555",
    "1500,",
    "1 500",
    "1.5000",
    "1.500,50 pesos",
    "１５００", // dígitos de ancho completo
    "99999999999999999999",
  ])("rechaza «%s»", (text) => {
    expect(parsePesos(text)).toBeNull();
  });
});

describe("pesosInputValue", () => {
  test("los pesos justos van sin decimales", () => {
    expect(pesosInputValue(150_000)).toBe("1500");
    expect(pesosInputValue(0)).toBe("0");
  });

  test("con centavos van siempre con dos decimales y coma", () => {
    expect(pesosInputValue(150_050)).toBe("1500,50");
    expect(pesosInputValue(150_005)).toBe("1500,05");
    expect(pesosInputValue(99)).toBe("0,99");
  });

  test("lo que muestra se vuelve a leer igual", () => {
    for (const cents of [0, 5, 99, 150_000, 150_050, MAX_PRICE_CENTS]) {
      expect(parsePesos(pesosInputValue(cents))).toBe(cents);
    }
  });
});

describe("formatPesos", () => {
  // Intl separa el $ del número con un espacio duro.
  const plain = (cents: number) => formatPesos(cents).replace(/ /g, " ");

  test("pesos justos, con punto de miles y sin decimales", () => {
    expect(plain(150_000)).toBe("$ 1.500");
    expect(plain(100_000_000)).toBe("$ 1.000.000");
  });

  test("con centavos, coma y dos decimales", () => {
    expect(plain(150_050)).toBe("$ 1.500,50");
  });

  test("el servicio sin cargo se ve como $ 0", () => {
    expect(plain(0)).toBe("$ 0");
  });
});

describe("formatDuration", () => {
  test.each([
    [5, "5 min"],
    [30, "30 min"],
    [45, "45 min"],
    [60, "1 h"],
    [90, "1 h 30"],
    [120, "2 h"],
    [150, "2 h 30"],
    [185, "3 h 5"],
    [480, "8 h"],
  ])("%i minutos se ven «%s»", (minutes, text) => {
    expect(formatDuration(minutes)).toBe(text);
  });
});

describe("formatPrice", () => {
  const plain = (cents: number) => formatPrice(cents).replace(/ /g, " ");

  test("el precio 0 es «Sin cargo»", () => {
    expect(plain(0)).toBe("Sin cargo");
  });

  test("lo demás se ve en pesos", () => {
    expect(plain(1_500_000)).toBe("$ 15.000");
    expect(plain(2_200_050)).toBe("$ 22.000,50");
  });
});
