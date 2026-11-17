import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
}

const BASE =
  "h-12 w-full rounded-md px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-control bg-surface text-foreground hover:bg-sunken",
};

/** Las clases del botón, para un `<Link>` que tiene que verse como botón. */
export function buttonClasses(
  variant: Variant = "primary",
  extra = "",
): string {
  return `${BASE} ${VARIANTS[variant]} flex items-center justify-center ${extra}`.trim();
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
