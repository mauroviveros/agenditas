"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  type EstadoIngresar,
  ingresarConEmail,
  ingresarConGoogle,
} from "./actions";

const inicial: EstadoIngresar = { error: null, email: "" };

export function FormularioIngresar() {
  const [email, enviarEmail, mandando] = useActionState(
    ingresarConEmail,
    inicial,
  );
  const [google, irAGoogle, yendo] = useActionState(ingresarConGoogle, inicial);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <form action={enviarEmail} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vos@tunegocio.com"
            defaultValue={email.email}
            key={email.email}
            aria-invalid={email.error ? true : undefined}
            aria-describedby={email.error ? "email-error" : undefined}
            required
          />
          {email.error && (
            <p id="email-error" className="text-destructive text-sm">
              {email.error}
            </p>
          )}
        </div>
        <Button type="submit" disabled={mandando}>
          {mandando ? "Mandando…" : "Mandame el link"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <Separator className="flex-1" />o<Separator className="flex-1" />
      </div>

      <form action={irAGoogle} className="flex flex-col gap-2">
        <Button type="submit" variant="outline" disabled={yendo}>
          {yendo ? "Abriendo Google…" : "Ingresar con Google"}
        </Button>
        {google.error && (
          <p role="alert" className="text-destructive text-sm">
            {google.error}
          </p>
        )}
      </form>
    </div>
  );
}
