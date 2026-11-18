import { getUpcomingHolidays } from "@/lib/session";
import { HolidaysCard, type Holidays } from "./card";

// Los próximos feriados. Si falla la lectura se avisa dentro de la card: los horarios
// siguen usables.
export async function UpcomingHolidays() {
  let result: Holidays;
  try {
    result = { holidays: await getUpcomingHolidays() };
  } catch (error) {
    console.error(error);
    result = { failed: true };
  }
  return <HolidaysCard result={result} />;
}
