import { PUBLIC_LINK_PREFIX } from "@/lib/business";

// Dónde reservan los clientes. Es texto hasta que exista la página pública (R5).
export function NavPublicLink({ slug }: { slug: string }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2.5 group-data-[collapsible=icon]:hidden">
      <p className="text-xs text-muted-foreground">Tu página de reservas</p>
      <p className="text-sm font-semibold break-all">
        {PUBLIC_LINK_PREFIX}
        <wbr />
        {slug}
      </p>
    </div>
  );
}
