import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { sendMagicLink } from "../lib/auth";
import { signInErrorMessage } from "../lib/errors";
import { redirectIfSignedIn } from "../lib/guards";

const RESEND_WAIT_SECONDS = 60;
const SECONDS_PER_MINUTE = 60;

export const Route = createFileRoute("/revisa-tu-mail")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.email) throw redirect({ to: "/ingresar" });
    await redirectIfSignedIn();
  },
  component: CheckEmailPage,
});

function formatWait(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function CheckEmailPage() {
  const { email } = Route.useSearch();
  const [wait, setWait] = useState(RESEND_WAIT_SECONDS);
  const resend = useMutation({
    mutationFn: () => sendMagicLink(email),
    onSuccess: () => setWait(RESEND_WAIT_SECONDS),
  });

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  return (
    <AuthLayout>
      <div
        aria-hidden="true"
        className="mb-5 grid size-[72px] place-items-center rounded-[20px] border border-border bg-surface text-3xl"
      >
        ✉
      </div>
      <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
        Revisá tu mail
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Te mandamos un link a{" "}
        <b className="break-all font-semibold text-foreground">{email}</b>.
        Tocalo para entrar. Vale una hora.
      </p>
      <div className="mt-7 space-y-4">
        <Button
          variant="secondary"
          disabled={wait > 0 || resend.isPending}
          onClick={() => resend.mutate()}
        >
          Reenviar el link
          {wait > 0 ? (
            <span className="ml-2 font-mono text-subtle-foreground">
              {formatWait(wait)}
            </span>
          ) : null}
        </Button>
        <output className="block min-h-5 text-center text-sm text-muted-foreground">
          {resend.isSuccess ? "Te lo mandamos de nuevo." : null}
        </output>
        {resend.isError ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {signInErrorMessage(resend.error)}
          </p>
        ) : null}
        <Link
          to="/ingresar"
          className="block py-3 text-center font-medium text-muted-foreground"
        >
          Usar otro mail
        </Link>
      </div>
    </AuthLayout>
  );
}
