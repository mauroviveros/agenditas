import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Tokens · Agenditas" };

interface Color {
  clase: string;
  nombre: string;
  hex: string;
  uso: string;
}

const COLORES: Color[] = [
  { clase: "bg-fondo", nombre: "Fondo hoja", hex: "#F2F4EE", uso: "Fondo de toda pantalla" },
  { clase: "bg-superficie", nombre: "Superficie", hex: "#FFFFFF", uso: "Turnos, chips, horarios" },
  { clase: "bg-tinta", nombre: "Tinta", hex: "#17261E", uso: "Texto y botones oscuros" },
  { clase: "bg-tinta-suave", nombre: "Tinta suave", hex: "#536158", uso: "Texto secundario" },
  { clase: "bg-acento", nombre: "Verde yerba", hex: "#1E5B3F", uso: "Acción principal" },
  { clase: "bg-resalte", nombre: "Amarillo mate", hex: "#F2C230", uso: "Solo «Ahora»" },
  { clase: "bg-bloque", nombre: "Bloque", hex: "#DDE5D6", uso: "Almuerzo, imprevistos" },
  { clase: "bg-linea", nombre: "Línea", hex: "#B9C4B4", uso: "Bordes de lo libre" },
];

const HORARIOS = ["14:30", "15:15", "16:00"];

/** Vitrina del sistema de diseño. Solo existe en desarrollo. */
export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-titulo text-[28px] leading-tight font-extrabold tracking-tight">
          Estilo Mate
        </h1>
        <p className="text-tinta-suave text-[13px] font-semibold">
          Los tokens de docs/DESIGN.md, aplicados.
        </p>
      </header>

      <section aria-labelledby="colores" className="flex flex-col gap-3">
        <h2 id="colores" className="font-titulo text-lg font-extrabold">Colores</h2>
        <ul className="grid grid-cols-2 gap-2">
          {COLORES.map((color) => (
            <li key={color.clase} className="bg-superficie rounded-control flex flex-col gap-2 p-2">
              <span className={`${color.clase} border-linea h-12 rounded-[10px] border`} />
              <span className="text-[15px] font-bold">{color.nombre}</span>
              <span className="text-tinta-suave text-[13px]">
                {color.hex} · {color.uso}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tipografia" className="flex flex-col gap-3">
        <h2 id="tipografia" className="font-titulo text-lg font-extrabold">Tipografía</h2>
        <p className="font-titulo text-[40px] leading-none font-extrabold tracking-tight">14:30</p>
        <p className="font-titulo text-[28px] leading-tight font-extrabold tracking-tight">
          ¿Cuándo te viene bien?
        </p>
        <p className="text-lg font-bold">Juan Pérez · Corte + barba</p>
        <p className="text-[15px] font-medium">Elegí un horario y listo, te esperamos.</p>
        <p className="text-tinta-suave text-[13px] font-semibold">Martes 17 de noviembre</p>
      </section>

      <section aria-labelledby="piezas" className="flex flex-col gap-3">
        <h2 id="piezas" className="font-titulo text-lg font-extrabold">Piezas</h2>

        <div className="bg-resalte rounded-panel flex flex-col gap-2 p-[18px]">
          <span className="bg-tinta text-resalte self-start rounded-full px-2.5 py-1 text-xs font-bold">
            Ahora
          </span>
          <span className="font-titulo text-[40px] leading-none font-extrabold">14:30</span>
          <span className="text-lg font-bold">Juan Pérez · Corte + barba</span>
          <div className="flex gap-2">
            <button type="button" className="bg-tinta text-superficie min-h-[46px] flex-1 rounded-full font-bold">
              Llegó
            </button>
            <button type="button" className="border-tinta min-h-[46px] flex-1 rounded-full border-2 font-bold">
              WhatsApp
            </button>
          </div>
        </div>

        <div className="bg-superficie rounded-control flex min-h-[46px] items-center justify-between px-3.5">
          <span className="text-[15px] font-bold">Lucas Martínez</span>
          <span className="text-tinta-suave text-[13px]">Corte</span>
        </div>
        <button type="button" className="border-linea text-acento rounded-control min-h-[46px] border-2 border-dashed px-3.5 text-left text-sm font-bold">
          Libre 30 min · sumar turno
        </button>
        <div className="bg-bloque rounded-control flex min-h-[46px] items-center gap-1.5 px-3.5 text-[15px] font-bold">
          Almuerzo <span className="text-tinta-suave font-medium">hasta 14:00</span>
        </div>

        <div role="group" aria-label="Horario" className="grid grid-cols-3 gap-2">
          {HORARIOS.map((hora, i) => (
            <button
              key={hora}
              type="button"
              aria-pressed={i === 1}
              className="bg-superficie aria-pressed:bg-acento aria-pressed:text-superficie min-h-[50px] rounded-full font-bold"
            >
              {hora}
            </button>
          ))}
        </div>

        <div className="bg-superficie shadow-flotante flex gap-2 rounded-full p-2">
          <button type="button" className="bg-acento text-superficie min-h-[50px] flex-[2] rounded-full font-bold">
            + Turno
          </button>
          <button type="button" className="bg-fondo min-h-[50px] flex-1 rounded-full font-bold">
            Salgo un rato
          </button>
        </div>
      </section>
    </main>
  );
}
