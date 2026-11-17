import type { ReactNode } from "react";

// Marco de las pantallas de ingreso: wordmark chico arriba y contenido a una columna.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-7">
      <p className="text-[15px] font-semibold text-muted-foreground">
        Agenditas
      </p>
      <div className="mt-12 flex flex-1 flex-col">{children}</div>
    </main>
  );
}
