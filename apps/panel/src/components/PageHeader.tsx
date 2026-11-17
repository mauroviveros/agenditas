import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PageHeaderProps {
  backTo: "/mas" | "/servicios";
  backLabel: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({
  backTo,
  backLabel,
  title,
  children,
}: PageHeaderProps) {
  return (
    <header className="px-5 pb-4 pt-3">
      <Link
        to={backTo}
        className="-ml-2 inline-flex min-h-11 items-center gap-1 px-2 font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span aria-hidden="true">←</span>
        {backLabel}
      </Link>
      <h1 className="text-[28px] font-semibold leading-[34px] tracking-tight">
        {title}
      </h1>
      {children}
    </header>
  );
}
