import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Tokens · Agenditas" };

interface Color {
  clase: string;
  nombre: string;
  hex: string;
  uso: string;
}

const COLORES: Color[] = [
  { clase: "bg-fondo", nombre: "Fondo", hex: "#F5F4F1", uso: "Fondo de la app y del sidebar" },
  { clase: "bg-superficie", nombre: "Superficie", hex: "#FFFFFF", uso: "Tarjetas, panel, campos" },
  { clase: "bg-tinta", nombre: "Tinta", hex: "#1C1C1A", uso: "Texto y foco" },
  { clase: "bg-tinta-suave", nombre: "Tinta suave", hex: "#5F5C56", uso: "Texto secundario" },
  { clase: "bg-acento", nombre: "Acento", hex: "#1F6F5C", uso: "Acción principal" },
  { clase: "bg-resalte", nombre: "Resalte", hex: "#E3EFE9", uso: "Selección" },
  { clase: "bg-bloque", nombre: "Bloque", hex: "#ECEBE7", uso: "Hover, almuerzo" },
  { clase: "bg-linea", nombre: "Línea", hex: "#E3E1DB", uso: "Divisores y bordes" },
  { clase: "bg-campo", nombre: "Campo", hex: "#8F8C85", uso: "Borde de un campo (3:1)" },
  { clase: "bg-peligro", nombre: "Peligro", hex: "#B42318", uso: "Errores, con ícono y texto" },
  { clase: "bg-peligro-suave", nombre: "Peligro suave", hex: "#FDF3F1", uso: "Fondo del aviso" },
];

/** Vitrina del sistema de diseño. Solo existe en desarrollo. */
export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-1">
        <PageTitle>Sistema de diseño</PageTitle>
        <p className="text-sm text-tinta-suave">Los tokens de docs/DESIGN.md, aplicados.</p>
      </header>

      <section aria-labelledby="colores" className="flex flex-col gap-3">
        <h2 id="colores" className="text-base font-semibold">Colores</h2>
        <ul className="grid grid-cols-2 gap-2">
          {COLORES.map((color) => (
            <li key={color.clase} className="flex flex-col gap-2 rounded-xl border bg-superficie p-2">
              <span className={`${color.clase} h-12 rounded-lg border`} />
              <span className="text-sm font-medium">{color.nombre}</span>
              <span className="text-xs text-tinta-suave">
                {color.hex} · {color.uso}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tipografia" className="flex flex-col gap-2">
        <h2 id="tipografia" className="text-base font-semibold">Tipografía</h2>
        <PageTitle>¿Cuándo te viene bien?</PageTitle>
        <p className="text-sm font-medium">Juan Pérez · Corte + barba</p>
        <p className="text-sm">Elegí un horario y listo, te esperamos.</p>
        <p className="text-sm text-tinta-suave">Martes 17 de noviembre · 14:30</p>
        <p className="font-mono text-sm">font-mono: 14:30</p>
      </section>

      <section aria-labelledby="piezas" className="flex flex-col gap-3">
        <h2 id="piezas" className="text-base font-semibold">Piezas</h2>
        <div className="flex gap-2">
          <Button size="xl" className="flex-1">Primario</Button>
          <Button size="xl" variant="outline" className="flex-1">Secundario</Button>
        </div>
        <Input placeholder="Nombre de tu negocio" aria-label="Campo de ejemplo" />
        <p
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-peligro/30 bg-peligro-suave p-4 text-sm font-medium"
        >
          <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-peligro" />
          Así se ve un error: con ícono y texto.
        </p>
        <div className="flex min-h-11 items-center justify-between rounded-xl border bg-superficie px-4 text-sm">
          <span className="font-medium">Lucas Martínez</span>
          <span className="text-tinta-suave">Corte</span>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-lg bg-bloque px-4 text-sm font-medium">
          Almuerzo <span className="font-normal text-tinta-suave">hasta 14:00</span>
        </div>
      </section>
    </main>
  );
}
