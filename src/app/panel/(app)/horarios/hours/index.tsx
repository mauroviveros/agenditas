import { Suspense } from "react";
import { getMyHours } from "@/lib/hours/queries";
import { weekdayIndex } from "@/lib/time";
import { HoursView } from "./view";
import { HoursSkeleton } from "./skeleton";

// Los horarios de la semana, con su esqueleto mientras cargan: el título y la bajada de
// Horarios no esperan esta lectura.
export function BusinessHours() {
  return (
    <Suspense fallback={<HoursSkeleton />}>
      <HoursLoader />
    </Suspense>
  );
}

// Lee la semana guardada y se la pasa al formulario. Sin try/catch a propósito: si la
// lectura falla, el error sube a panel/error.tsx. Mostrar una semana vacía invitaría a
// guardar y pisar los horarios reales.
async function HoursLoader() {
  const hours = await getMyHours();
  return <HoursView initial={hours} today={weekdayIndex(new Date())} />;
}
