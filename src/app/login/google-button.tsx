"use client";

import { useFormStatus } from "react-dom";

// Mientras se arma la URL y el navegador sale a Google, el botón avisa y no se
// puede tocar dos veces.
export function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-acento px-6 text-base font-bold text-superficie transition-[background-color,transform] duration-150 ease-out hover:bg-tinta active:scale-[0.98] disabled:cursor-progress disabled:bg-tinta"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-superficie">
        {pending ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="size-4 animate-spin text-acento motion-reduce:animate-none"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          // oxlint-disable-next-line nextjs/no-img-element -- svg estático de 16 px, sin optimizar
          <img src="/google-g.svg" alt="" width={16} height={16} />
        )}
      </span>
      {pending ? "Abriendo Google…" : "Entrar con Google"}
    </button>
  );
}
