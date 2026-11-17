import { Button } from "./Button";

export function LoadingNote() {
  return (
    <output className="block px-5 py-8 text-center text-muted-foreground">
      Cargando…
    </output>
  );
}

interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="mx-5 rounded-lg border border-border bg-surface p-5"
    >
      <p>{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
