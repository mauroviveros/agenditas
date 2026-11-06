import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Revisá tu mail · Agenditas" };

export default function RevisaTuMailPage() {
  return (
    <>
      <Mail aria-hidden className="size-6 text-primary-text" />
      <h1 className="mt-4 font-semibold text-[28px] leading-[34px] tracking-[-0.01em]">
        Revisá tu mail
      </h1>
      <p className="mt-2 text-foreground-2">
        Te mandamos un link para ingresar. Vence en una hora y sirve una sola
        vez.
      </p>
      <p className="mt-6 text-foreground-2 text-sm">
        ¿No llegó? Mirá en spam o{" "}
        <Link
          href="/ingresar"
          className="text-primary-text underline-offset-4 hover:underline"
        >
          pedí otro link
        </Link>
        .
      </p>
    </>
  );
}
