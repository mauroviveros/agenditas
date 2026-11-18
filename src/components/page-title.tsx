import type { ComponentProps } from "react";
import { cn } from "cn";

// Título de pantalla: un solo estilo para todas las rutas (DESIGN.md).
export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn("font-heading text-2xl font-semibold tracking-tight text-balance", className)}
      {...props}
    />
  );
}
