import type { Metadata } from "next";
import { Suspense } from "react";
import { signInWithGoogle } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = {
  title: "Entrar · Agenditas",
};

const ERROR_MESSAGES: Record<string, string> = {
  callback: "No pudimos terminar de entrar con Google. Probá de nuevo.",
  oauth: "No pudimos abrir Google. Probá de nuevo en un rato.",
};

// El texto del título y el botón quedan abajo, al alcance del pulgar.
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <p className="font-titulo text-xl font-extrabold tracking-[-0.02em]">Agenditas</p>

      <div className="mt-auto pt-16">
        <h1 className="font-titulo text-[1.75rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-balance">
          Entrá a tu agenda
        </h1>
        <p className="mt-2 text-tinta-suave">Con tu cuenta de Google, sin contraseñas nuevas.</p>
      </div>

      <Suspense fallback={null}>
        <LoginError searchParams={searchParams} />
      </Suspense>

      <form action={signInWithGoogle} className="mt-8">
        <SubmitButton
          pendingLabel="Abriendo Google…"
          // oxlint-disable-next-line nextjs/no-img-element -- svg estático de 16 px, sin optimizar
          icon={<img src="/google-g.svg" alt="" width={16} height={16} />}
        >
          Entrar con Google
        </SubmitButton>
      </form>
    </main>
  );
}

async function LoginError({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;
  if (!message) {
    return null;
  }

  return (
    <div role="alert" className="mt-6 flex items-start gap-3 rounded-control bg-bloque p-4">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mt-px size-5 shrink-0"
      >
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
      </svg>
      <p className="font-semibold">{message}</p>
    </div>
  );
}

