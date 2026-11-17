import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "../components/BottomNav";
import { HoursEditor } from "../components/HoursEditor";
import { PageHeader } from "../components/PageHeader";
import { LoadError, LoadingNote } from "../components/QueryState";
import { requireBusiness } from "../lib/guards";
import { weeklyHoursQuery } from "../lib/hours";
import { usePageTitle } from "../lib/page-title";

export const Route = createFileRoute("/horarios")({
  beforeLoad: ({ context }) => requireBusiness(context.queryClient),
  component: HoursPage,
});

function HoursPage() {
  usePageTitle("Horarios");
  const hours = useQuery(weeklyHoursQuery);

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      <PageHeader backTo="/mas" backLabel="Más" title="Horarios">
        <p className="text-muted-foreground">
          Abrí los días que atendés. Un tramo por día, con almuerzo si lo hacés.
        </p>
      </PageHeader>
      {hours.isPending ? <LoadingNote /> : null}
      {hours.isError ? (
        <LoadError
          message="No pudimos traer tus horarios."
          onRetry={() => hours.refetch()}
        />
      ) : null}
      {hours.data ? <HoursEditor rows={hours.data} /> : null}
      <BottomNav />
    </div>
  );
}
