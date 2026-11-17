import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { signOut } from "../lib/auth";
import { requireBusiness } from "../lib/guards";

export const Route = createFileRoute("/mas")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: MorePage,
});

function MorePage() {
  const { business, session } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const leave = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/ingresar", replace: true });
    },
  });

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <header className="px-5 pb-4 pt-6">
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
          Más
        </h1>
      </header>
      <section className="mx-5 rounded-lg border border-border bg-surface p-5">
        <p className="font-semibold">{business.name}</p>
        <p className="mt-1 break-all text-muted-foreground">
          {session.user.email}
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          disabled={leave.isPending}
          onClick={() => leave.mutate()}
        >
          Salir
        </Button>
        {leave.isError ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            No pudimos cerrar la sesión. Probá de nuevo.
          </p>
        ) : null}
      </section>
      <BottomNav />
    </div>
  );
}
