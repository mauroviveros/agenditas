import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsuario } from "@/lib/auth/usuario";
import { salir } from "../(auth)/ingresar/actions";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex h-14 items-center justify-between gap-4 border-border border-b px-4">
        <p className="font-semibold">Agenditas</p>
        <Suspense fallback={<Skeleton className="h-8 w-40" />}>
          <Cuenta />
        </Suspense>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}

async function Cuenta() {
  const usuario = await getUsuario();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="truncate text-foreground-2 text-sm">
        {usuario.email}
      </span>
      <form action={salir}>
        <Button type="submit" variant="ghost" size="sm">
          Salir
        </Button>
      </form>
    </div>
  );
}
