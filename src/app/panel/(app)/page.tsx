import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { getUserId } from "@/lib/user";

export const metadata: Metadata = {
  title: "Panel · Agenditas",
};

// El layout ya redirige si falta sesión o negocio; acá solo se muestra.
// Mientras carga, Next muestra loading.tsx. El título es el nombre del negocio y lo pone el
// encabezado del layout.
export default async function HomePage() {
  // Layout y página renderizan en paralelo: sin sesión no se toca la tabla.
  if (!(await getUserId())) {
    return null;
  }
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-dashed border-border p-6">
      <h2 className="text-base font-semibold">Tu agenda aparece acá</h2>
      <p className="mt-1 text-muted-foreground">
        Cuando cargues tus horarios y tus servicios, vas a ver los turnos del día en este lugar.
      </p>
      <Link href="/panel/horarios" className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
        Cargar mis horarios
      </Link>
    </section>
  );
}
