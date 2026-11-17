import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { GOOGLE_ENABLED, sendMagicLink, signInWithGoogle } from "../lib/auth";
import { signInErrorMessage } from "../lib/errors";
import { redirectIfSignedIn } from "../lib/guards";

export const Route = createFileRoute("/ingresar")({
  beforeLoad: redirectIfSignedIn,
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const send = useMutation({
    mutationFn: sendMagicLink,
    onSuccess: () =>
      navigate({ to: "/revisa-tu-mail", search: { email: email.trim() } }),
  });
  const google = useMutation({ mutationFn: signInWithGoogle });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send.mutate(email.trim());
  }

  const error = send.isError
    ? signInErrorMessage(send.error)
    : google.isError
      ? "No pudimos entrar con Google. Probá con tu mail."
      : undefined;

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
        Entrá a tu agenda
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Te mandamos un link al mail. Sin contraseña.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field
          label="Tu mail"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <Button type="submit" disabled={send.isPending}>
          {send.isPending ? "Enviando…" : "Enviarme el link"}
        </Button>
      </form>
      {GOOGLE_ENABLED ? (
        <>
          <p className="my-4 text-center text-muted-foreground">o</p>
          <Button
            variant="secondary"
            disabled={google.isPending}
            onClick={() => google.mutate()}
          >
            Seguir con Google
          </Button>
        </>
      ) : null}
    </AuthLayout>
  );
}
