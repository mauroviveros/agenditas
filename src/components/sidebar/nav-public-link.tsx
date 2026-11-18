import { PUBLIC_LINK_PATH } from "@/lib/business";
import { getPublicHost } from "@/lib/public-link";

// Dónde reservan los clientes. Es texto hasta que exista la página pública (R5).
// Lee el dominio del servidor (header Host), así que va dentro del <Suspense> del layout.
export async function NavPublicLink({ slug }: { slug: string }) {
  const host = await getPublicHost();

  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2.5 group-data-[collapsible=icon]:hidden">
      <p className="text-xs text-muted-foreground">Tu página de reservas</p>
      <p className="text-sm font-semibold break-words">
        {`${host}${PUBLIC_LINK_PATH}`}
        <wbr />
        {slug}
      </p>
    </div>
  );
}
