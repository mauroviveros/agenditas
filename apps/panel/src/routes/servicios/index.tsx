import { formatDuration, formatPrice } from "@agenditas/db";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "../../components/BottomNav";
import { buttonClasses } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";
import { LoadError, LoadingNote } from "../../components/QueryState";
import { requireBusiness } from "../../lib/guards";
import { usePageTitle } from "../../lib/page-title";
import { servicesQuery } from "../../lib/services";

export const Route = createFileRoute("/servicios/")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: ServicesPage,
});

function ServicesPage() {
  usePageTitle("Servicios");
  const services = useQuery(servicesQuery);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <PageHeader backTo="/mas" backLabel="Más" title="Servicios" />
      {services.isPending ? <LoadingNote /> : null}
      {services.isError ? (
        <LoadError
          message="No pudimos traer tus servicios."
          onRetry={() => services.refetch()}
        />
      ) : null}
      {services.data?.length === 0 ? (
        <section className="mx-5 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold leading-[26px]">
            Cargá tu primer servicio
          </h2>
          <p className="mb-4 mt-1 text-muted-foreground">
            Es lo que tus clientes eligen cuando sacan un turno.
          </p>
          <Link to="/servicios/nuevo" className={buttonClasses()}>
            Nuevo servicio
          </Link>
        </section>
      ) : null}
      {services.data && services.data.length > 0 ? (
        <>
          <ul className="mx-5 space-y-2">
            {services.data.map((service) => (
              <li key={service.id}>
                <Link
                  to="/servicios/$id"
                  params={{ id: service.id }}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>
                    <span className="block font-semibold">{service.name}</span>
                    <span className="block font-mono text-muted-foreground">
                      {formatDuration(service.duration_minutes)} ·{" "}
                      {formatPrice(service.price_ars)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-subtle-foreground">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-5 mt-4">
            <Link to="/servicios/nuevo" className={buttonClasses()}>
              Nuevo servicio
            </Link>
          </div>
        </>
      ) : null}
      <BottomNav />
    </div>
  );
}
