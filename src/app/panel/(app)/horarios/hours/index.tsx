import { Suspense } from "react";
import { getMyHours } from "@/lib/hours/queries";
import { weekdayIndex } from "@/lib/time";
import { HoursForm } from "./form";
import { HoursFormSkeleton } from "./skeleton";

// Los horarios de la semana, con su esqueleto mientras cargan: el título y la bajada de
// Horarios no esperan esta lectura.
export function BusinessHours() {
  return (
    <Suspense fallback={<HoursFormSkeleton />}>
      <HoursLoader />
    </Suspense>
  );
}

// Lee la semana guardada y se la pasa al formulario. Sin try/catch a propósito: si la
// lectura falla, el error sube a panel/error.tsx. Mostrar una semana vacía invitaría a
// guardar y pisar los horarios reales.
async function HoursLoader() {
  const hours = await getMyHours();
  return <HoursForm initial={hours} today={weekdayIndex(new Date())} />;
}
