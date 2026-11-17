import { Link } from "@tanstack/react-router";

const ITEMS = [
  { to: "/", label: "Agenda" },
  { to: "/mas", label: "Más" },
] as const;

const LINK_CLASS =
  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium text-subtle-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";

export function BottomNav() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 border-t border-border bg-surface"
    >
      <div className="mx-auto grid max-w-md grid-cols-2">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={LINK_CLASS}
            activeProps={{
              className: `${LINK_CLASS} !text-primary !font-semibold`,
              "aria-current": "page",
            }}
            activeOptions={{ exact: true }}
          >
            <span
              aria-hidden="true"
              className="size-[22px] rounded-md border-2 border-current"
            />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
