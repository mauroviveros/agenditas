import { describe, expect, test } from "vitest";
import {
  copyDay,
  copyMessage,
  dayDuration,
  joinLunch,
  rangesFromWeek,
  replaceDay,
  splitLunch,
  summarizeDay,
  toggleDay,
  weekDuration,
  weekFromRanges,
  ALL_DAYS,
  WORKWEEK,
} from "./week";

const range = (weekday: number, start_time: string, end_time: string) => ({
  weekday,
  start_time,
  end_time,
});

describe("weekFromRanges", () => {
  test("arma siete días y deja vacíos los que no atienden", () => {
    const week = weekFromRanges([range(1, "09:00", "13:00")]);

    expect(week).toHaveLength(7);
    expect(week[0]).toEqual([{ start_time: "09:00", end_time: "13:00" }]);
    expect(week[1]).toEqual([]);
  });

  test("ordena las franjas de cada día por hora de inicio", () => {
    const week = weekFromRanges([
      range(3, "15:00", "19:00"),
      range(3, "09:00", "13:00"),
    ]);

    expect(week[2]?.map((slot) => slot.start_time)).toEqual(["09:00", "15:00"]);
  });
});

describe("rangesFromWeek", () => {
  test("vuelve a la lista de franjas con el día de 1 a 7", () => {
    const week = weekFromRanges([
      range(1, "09:00", "13:00"),
      range(7, "10:00", "12:00"),
    ]);

    expect(rangesFromWeek(week)).toEqual([
      range(1, "09:00", "13:00"),
      range(7, "10:00", "12:00"),
    ]);
  });

  test("una semana sin franjas da una lista vacía", () => {
    expect(rangesFromWeek(weekFromRanges([]))).toEqual([]);
  });
});

const slot = (start_time: string, end_time: string) => ({
  start_time,
  end_time,
});

describe("toggleDay", () => {
  test("abrir un día cerrado lo deja de 09:00 a 18:00", () => {
    const week = toggleDay(weekFromRanges([]), 2);

    expect(week[2]).toEqual([slot("09:00", "18:00")]);
    expect(week[1]).toEqual([]);
  });

  test("cerrar un día abierto le saca todas las franjas", () => {
    const week = toggleDay(
      weekFromRanges([range(3, "09:00", "13:00"), range(3, "14:00", "18:00")]),
      2,
    );

    expect(week[2]).toEqual([]);
  });
});

describe("splitLunch", () => {
  test("corta una franja corrida en dos con una hora de almuerzo al medio", () => {
    expect(splitLunch([slot("09:00", "17:00")])).toEqual([
      slot("09:00", "13:00"),
      slot("14:00", "17:00"),
    ]);
  });

  test("el almuerzo es de 13 a 14 cuando la franja lo contiene", () => {
    expect(splitLunch([slot("09:00", "18:00")])).toEqual([
      slot("09:00", "13:00"),
      slot("14:00", "18:00"),
    ]);
  });

  test("si la franja no contiene de 13 a 14, busca la hora entera más cercana a la mitad", () => {
    expect(splitLunch([slot("14:00", "20:00")])).toEqual([
      slot("14:00", "17:00"),
      slot("18:00", "20:00"),
    ]);
    expect(splitLunch([slot("08:00", "13:30")])).toEqual([
      slot("08:00", "11:00"),
      slot("12:00", "13:30"),
    ]);
  });

  test("si la franja es muy corta para un almuerzo, la deja como está", () => {
    expect(splitLunch([slot("09:00", "10:00")])).toEqual([
      slot("09:00", "10:00"),
    ]);
  });

  test("no corta si la segunda franja quedaría vacía", () => {
    expect(splitLunch([slot("09:00", "11:00")])).toEqual([
      slot("09:00", "11:00"),
    ]);
    expect(splitLunch([slot("10:40", "12:50")])).toEqual([
      slot("10:40", "12:50"),
    ]);
  });

  test("si ya hay dos franjas, no corta de nuevo", () => {
    const two = [slot("09:00", "13:00"), slot("14:00", "18:00")];

    expect(splitLunch(two)).toEqual(two);
  });

  test("sin franjas no hay nada para cortar", () => {
    expect(splitLunch([])).toEqual([]);
  });
});

describe("joinLunch", () => {
  test("une las dos franjas en una sola, sin almuerzo", () => {
    expect(joinLunch([slot("09:00", "13:00"), slot("14:00", "18:00")])).toEqual(
      [slot("09:00", "18:00")],
    );
  });

  test("con una sola franja no hace nada", () => {
    expect(joinLunch([slot("09:00", "13:00")])).toEqual([
      slot("09:00", "13:00"),
    ]);
  });
});

describe("summarizeDay", () => {
  test("lista las franjas con el almuerzo como separador", () => {
    expect(summarizeDay([slot("09:00", "13:00"), slot("14:00", "17:00")])).toBe(
      "09:00–13:00 · 14:00–17:00",
    );
  });

  test("un día sin franjas no atiende", () => {
    expect(summarizeDay([])).toBe("No atiende");
  });
});

describe("weekDuration", () => {
  test("suma las horas de todas las franjas, sin contar el almuerzo", () => {
    const week = weekFromRanges([
      range(1, "09:00", "13:00"),
      range(1, "14:00", "17:00"),
      range(2, "10:00", "14:00"),
    ]);

    expect(weekDuration(week)).toBe("11 h");
  });

  test("muestra los minutos cuando no son horas redondas", () => {
    expect(weekDuration(weekFromRanges([range(1, "09:00", "16:30")]))).toBe(
      "7 h 30",
    );
  });

  test("una semana sin franjas son 0 h", () => {
    expect(weekDuration(weekFromRanges([]))).toBe("0 h");
  });
});

describe("copyDay", () => {
  const week = weekFromRanges([
    range(1, "09:00", "13:00"),
    range(1, "15:00", "19:00"),
    range(2, "10:00", "12:00"),
  ]);

  test("copia las franjas del día a los días elegidos y reemplaza las que tenían", () => {
    const copied = copyDay(week, 0, [1, 2]);

    expect(copied[1]).toEqual(week[0]);
    expect(copied[2]).toEqual(week[0]);
  });

  test("no toca los demás días ni el original", () => {
    const copied = copyDay(week, 0, [2]);

    expect(copied[1]).toEqual(week[1]);
    expect(week[2]).toEqual([]);
    expect(copied).not.toBe(week);
  });

  test("un día copiado se edita sin mover al original", () => {
    const copied = copyDay(week, 0, [2]);

    expect(copied[2]?.[0]).not.toBe(copied[0]?.[0]);
  });

  test("copiar un día sobre sí mismo no hace nada", () => {
    expect(copyDay(week, 0, [0])).toEqual(week);
  });
});

describe("dayDuration", () => {
  test("suma las franjas sin contar el almuerzo", () => {
    const slots = [
      { start_time: "09:00", end_time: "13:00" },
      { start_time: "14:00", end_time: "18:00" },
    ];
    expect(dayDuration(slots)).toBe("8 h");
  });

  test("muestra los minutos cuando no es una hora justa", () => {
    expect(dayDuration([{ start_time: "09:00", end_time: "16:30" }])).toBe(
      "7 h 30",
    );
  });

  test("un día cerrado no tiene duración", () => {
    expect(dayDuration([])).toBe("");
  });
});

describe("copyMessage", () => {
  test("dice a qué días se copió el horario del día", () => {
    expect(copyMessage("Lunes", WORKWEEK)).toBe(
      "Copiamos el horario del lunes a lunes a viernes.",
    );
    expect(copyMessage("Sábado", ALL_DAYS)).toBe(
      "Copiamos el horario del sábado a toda la semana.",
    );
  });
});

describe("replaceDay", () => {
  const week = weekFromRanges([range(1, "09:00", "13:00"), range(3, "10:00", "12:00")]);

  test("cambia las franjas de ese día y deja los demás igual", () => {
    const next = replaceDay(week, 1, [{ start_time: "08:00", end_time: "09:00" }]);

    expect(next[1]).toEqual([{ start_time: "08:00", end_time: "09:00" }]);
    expect(next[0]).toEqual(week[0]);
    expect(next[2]).toEqual(week[2]);
  });

  test("no modifica la semana original", () => {
    replaceDay(week, 0, []);

    expect(week[0]).toEqual([{ start_time: "09:00", end_time: "13:00" }]);
  });
});
