import { getUpcomingHolidays } from "@/lib/holidays/queries";
import { HolidaysBody, HolidaysEmpty, HolidaysError } from "./body";
import { HolidaysCard } from "./card";

// Pide los feriados y elige qué mostrar dentro de la card: la lista, el aviso de vacío o,
// si falla la lectura, el de error (los horarios siguen usables).
export async function HolidaysLoader() {
  try {
    const holidays = await getUpcomingHolidays();
    return (
      <HolidaysCard>
        {holidays.length === 0 ? <HolidaysEmpty /> : <HolidaysBody holidays={holidays} />}
      </HolidaysCard>
    );
  } catch (error) {
    console.error(error);
    return (
      <HolidaysCard>
        <HolidaysError />
      </HolidaysCard>
    );
  }
}
