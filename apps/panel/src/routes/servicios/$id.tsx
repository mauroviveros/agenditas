import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "../../components/BottomNav";
import { PageHeader } from "../../components/PageHeader";
import { LoadError, LoadingNote } from "../../components/QueryState";
import { ServiceForm } from "../../components/ServiceForm";
import { requireBusiness } from "../../lib/guards";
import { usePageTitle } from "../../lib/page-title";
import { servicesQuery } from "../../lib/services";

export const Route = createFileRoute("/servicios/$id")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: EditServicePage,
});

function EditServicePage() {
  usePageTitle("Editar servicio");
  const { business } = Route.useRouteContext();
  const { id } = Route.useParams();
  const services = useQuery(servicesQuery);
  const service = services.data?.find((candidate) => candidate.id === id);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <PageHeader
        backTo="/servicios"
        backLabel="Servicios"
        title="Editar servicio"
      />
      {services.isPending ? <LoadingNote /> : null}
      {services.isError ? (
        <LoadError
          message="No pudimos traer el servicio."
          onRetry={() => services.refetch()}
        />
      ) : null}
      {services.data && !service ? (
        <p className="mx-5">
          No encontramos este servicio. Puede que ya esté archivado.{" "}
          <Link to="/servicios" className="font-medium text-primary underline">
            Volver a servicios
          </Link>
        </p>
      ) : null}
      {service ? (
        <ServiceForm
          key={service.id}
          businessId={business.id}
          service={service}
        />
      ) : null}
      <BottomNav />
    </div>
  );
}
