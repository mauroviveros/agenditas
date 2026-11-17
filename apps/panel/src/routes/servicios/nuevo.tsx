import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "../../components/BottomNav";
import { PageHeader } from "../../components/PageHeader";
import { ServiceForm } from "../../components/ServiceForm";
import { requireBusiness } from "../../lib/guards";
import { usePageTitle } from "../../lib/page-title";

export const Route = createFileRoute("/servicios/nuevo")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: NewServicePage,
});

function NewServicePage() {
  usePageTitle("Nuevo servicio");
  const { business } = Route.useRouteContext();

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <PageHeader
        backTo="/servicios"
        backLabel="Servicios"
        title="Nuevo servicio"
      />
      <ServiceForm businessId={business.id} />
      <BottomNav />
    </div>
  );
}
