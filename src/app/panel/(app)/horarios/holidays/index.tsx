import { Suspense } from "react";
import { getUpcomingHolidays } from "@/lib/holidays/queries";
import { HolidaysCard, type Holidays } from "./card";
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

// Si falla la lectura se avisa dentro de la card: los horarios siguen usables.
async function HolidaysLoader() {
  let result: Holidays;
  try {
    result = { holidays: await getUpcomingHolidays() };
  } catch (error) {
    console.error(error);
    result = { failed: true };
  }
  return <HolidaysCard result={result} />;
}
