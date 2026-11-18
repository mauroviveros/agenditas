import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Tokens · Agenditas" };

interface Color {
  clase: string;
  nombre: string;
  uso: string;
}

// Los tokens de shadcn (neutral) de globals.css.
const COLORES: Color[] = [
  { clase: "bg-background", nombre: "background", uso: "Fondo de la app" },
  { clase: "bg-card", nombre: "card", uso: "Tarjetas y panel" },
  { clase: "bg-primary", nombre: "primary", uso: "Acción principal" },
  { clase: "bg-secondary", nombre: "secondary", uso: "Acción secundaria" },
  { clase: "bg-muted", nombre: "muted", uso: "Fondos suaves, hover" },
  { clase: "bg-accent", nombre: "accent", uso: "Ítem activo" },
  { clase: "bg-destructive", nombre: "destructive", uso: "Errores, con ícono y texto" },
  { clase: "bg-border", nombre: "border", uso: "Divisores y bordes" },
  { clase: "bg-input", nombre: "input", uso: "Borde de un campo" },
  { clase: "bg-ring", nombre: "ring", uso: "Anillo de foco" },
];

/** Vitrina del sistema de diseño. Solo existe en desarrollo. */
export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Sistema de diseño</h1>
        <p className="text-sm text-muted-foreground">Los tokens de docs/DESIGN.md, aplicados.</p>
      </header>

      <section aria-labelledby="colores" className="flex flex-col gap-3">
        <h2 id="colores" className="text-base font-semibold">Colores</h2>
        <ul className="grid grid-cols-2 gap-2">
          {COLORES.map((color) => (
            <li key={color.clase} className="flex flex-col gap-2 rounded-xl border bg-card p-2">
              <span className={`${color.clase} h-12 rounded-lg border`} />
              <span className="text-sm font-medium">{color.nombre}</span>
              <span className="text-xs text-muted-foreground">{color.uso}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tipografia" className="flex flex-col gap-2">
        <h2 id="tipografia" className="text-base font-semibold">Tipografía</h2>
        <p className="font-heading text-2xl font-semibold tracking-tight">¿Cuándo te viene bien?</p>
        <p className="text-sm font-medium">Juan Pérez · Corte + barba</p>
        <p className="text-sm">Elegí un horario y listo, te esperamos.</p>
        <p className="text-sm text-muted-foreground">Martes 17 de noviembre · 14:30</p>
        <p className="font-mono text-sm">font-mono: 14:30</p>
      </section>

      <section aria-labelledby="piezas" className="flex flex-col gap-3">
        <h2 id="piezas" className="text-base font-semibold">Piezas</h2>
        <div className="flex gap-2">
          <Button size="lg" className="flex-1">Primario</Button>
          <Button size="lg" variant="outline" className="flex-1">Secundario</Button>
        </div>
        <Input placeholder="Nombre de tu negocio" aria-label="Campo de ejemplo" />
        <p
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium"
        >
          <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
          Así se ve un error: con ícono y texto.
        </p>
        <div className="flex min-h-11 items-center justify-between rounded-xl border bg-card px-4 text-sm">
          <span className="font-medium">Lucas Martínez</span>
          <span className="text-muted-foreground">Corte</span>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-lg bg-muted px-4 text-sm font-medium">
          Almuerzo <span className="font-normal text-muted-foreground">hasta 14:00</span>
        </div>
      </section>
    </main>
  );
}
