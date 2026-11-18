import { Suspense } from "react";
import { HolidaysLoader } from "./loader";
import { HolidaysCardSkeleton } from "./skeleton";

// Los próximos feriados, con su esqueleto mientras cargan: la pantalla de Horarios no
// espera esta lectura.
export function UpcomingHolidays() {
  return (
    <Suspense fallback={<HolidaysCardSkeleton />}>
      <HolidaysLoader />
    </Suspense>
  );
}
