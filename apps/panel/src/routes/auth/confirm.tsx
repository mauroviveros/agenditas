import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthLayout } from "../../components/AuthLayout";
import { confirmMagicLink } from "../../lib/auth";

export const Route = createFileRoute("/auth/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    token_hash: typeof search.token_hash === "string" ? search.token_hash : "",
  }),
  component: ConfirmPage,
});

// El token se canjea una sola vez: useQuery lo deduplica aunque StrictMode monte dos veces.
function ConfirmPage() {
  const { token_hash: tokenHash } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useQuery({
    queryKey: ["confirm-link", tokenHash],
    queryFn: async () => {
      await confirmMagicLink(tokenHash);
      return true;
    },
    enabled: tokenHash !== "",
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (!confirm.isSuccess) return;
    queryClient.removeQueries({ queryKey: ["business"] });
    void navigate({ to: "/", replace: true });
  }, [confirm.isSuccess, navigate, queryClient]);

  if (tokenHash === "" || confirm.isError) {
    return (
      <AuthLayout>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
          Ese link venció
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Los links valen una hora y se usan una sola vez. Pedí otro para
          entrar.
        </p>
        <Link
          to="/ingresar"
          className="mt-7 grid h-12 place-items-center rounded-md bg-primary text-[15px] font-semibold text-primary-foreground"
        >
          Pedir otro link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <output className="text-base text-muted-foreground">Entrando…</output>
    </AuthLayout>
  );
}
