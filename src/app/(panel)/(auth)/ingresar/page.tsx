import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mensajeDeError } from "@/lib/auth/errores";
import { FormularioIngresar } from "./formulario";

export const metadata: Metadata = { title: "Ingresar · Agenditas" };

export default function IngresarPage({ searchParams }: PageProps<"/ingresar">) {
  return (
    <>
      <h1 className="font-semibold text-[28px] leading-[34px] tracking-[-0.01em]">
        Ingresá a tu agenda
      </h1>
      <p className="mt-2 text-foreground-2">
        Te mandamos un link a tu email. Sin contraseñas.
      </p>
      <Suspense>
        <ErrorDelLink searchParams={searchParams} />
      </Suspense>
      <FormularioIngresar />
    </>
  );
}

// Errores que vuelven de /auth/callback (link vencido, Google cancelado).
async function ErrorDelLink({
  searchParams,
}: Pick<PageProps<"/ingresar">, "searchParams">) {
  const { error } = await searchParams;
  if (typeof error !== "string") return null;
  return (
    <Alert variant="destructive" className="mt-6">
      <TriangleAlert />
      <AlertDescription>{mensajeDeError(error)}</AlertDescription>
    </Alert>
  );
}
