import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { signOut } from "../lib/auth";
import { requireBusiness } from "../lib/guards";
import { usePageTitle } from "../lib/page-title";

const SECTIONS = [
  { to: "/servicios", label: "Servicios" },
  { to: "/horarios", label: "Horarios" },
  { to: "/dias-cerrados", label: "Días cerrados" },
] as const;

export const Route = createFileRoute("/mas")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: MorePage,
});

function MorePage() {
  usePageTitle("Más");
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
      <nav
        aria-label="Tu negocio"
        className="mx-5 mb-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface"
      >
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="flex min-h-14 items-center justify-between px-5 font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
          >
            {section.label}
            <span aria-hidden="true" className="text-subtle-foreground">
              ›
            </span>
          </Link>
        ))}
      </nav>
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
