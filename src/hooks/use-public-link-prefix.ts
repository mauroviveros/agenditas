"use client";

import { useSyncExternalStore } from "react";
import { PUBLIC_LINK_PREFIX } from "@/lib/business";

const subscribe = () => () => {};

// El link público se arma con el dominio donde se abre la app (localhost, preview o
// producción). Mientras renderiza en el servidor usa el de producción.
export function usePublicLinkPrefix(): string {
  return useSyncExternalStore(
    subscribe,
    () => `${window.location.host}/reservar/`,
    () => PUBLIC_LINK_PREFIX,
  );
}
