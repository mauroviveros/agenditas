import { type InputHTMLAttributes, type ReactNode, useId } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  prefix?: string;
}

// Etiqueta y mensaje atados al input; el error se anuncia con role="alert".
export function Field({
  label,
  hint,
  error,
  prefix,
  className = "",
  ...props
}: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const hasMessage = Boolean(error ?? hint);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold">
        {label}
      </label>
      <div
        className={`flex h-12 items-center overflow-hidden rounded-md border bg-surface text-base focus-within:outline-2 focus-within:outline-primary ${
          error ? "border-destructive" : "border-border-strong"
        }`}
      >
        {prefix ? (
          <span className="pl-3.5 font-mono text-[15px] text-subtle-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`h-full min-w-0 flex-1 bg-transparent px-3.5 outline-none ${
            prefix ? "pl-0 font-mono text-[15px] font-semibold" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {hasMessage ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={`mt-2 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
