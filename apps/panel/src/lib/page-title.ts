import { useEffect } from "react";

// Cada pantalla pone su título: lo lee el lector de pantalla al navegar (WCAG 2.4.2).
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · Agenditas`;
  }, [title]);
}
