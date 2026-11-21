"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_MS = 60_000;

// Vuelve a leer el día cada minuto, y al volver a la pestaña, para que la línea de «ahora», lo que
// ya pasó y el próximo turno no queden viejos. No dibuja nada.
// shortcut: cada vuelta repite la consulta del día; si pesa, mover la línea de ahora al cliente
// y refrescar solo cuando cambia el estado de un turno.
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) {
        router.refresh();
      }
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  return null;
}
