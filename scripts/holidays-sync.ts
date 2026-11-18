// Carga los feriados de Argentina del año actual y el siguiente en la tabla `holidays`.
// Uso: `pnpm holidays:sync`. Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del
// entorno (o de .env.local). La clave de servicio se salta la RLS: no se imprime ni se
// versiona. Se corre a mano una vez al año; es idempotente (actualiza por fecha) y saca las
// fechas de esos dos años que la API ya no trae (por ejemplo, un feriado trasladado).
import { createClient } from "@supabase/supabase-js";
import { parseHolidays } from "../src/lib/holidays/parse.ts";
import type { Database } from "../src/lib/supabase/database.types.ts";

const API = "https://api.argentinadatos.com/v1/feriados";
const TIMEOUT_MS = 15_000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (ver .env.example).`);
  }
  return value;
}

async function fetchYear(year: number) {
  // shortcut: sin tope de tamaño de la respuesta; el timeout de 15 s y el máximo de filas de
  // parseHolidays lo acotan. Ponerlo si el script pasa a correr desatendido (cron o CI).
  const response = await fetch(`${API}/${year}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`ArgentinaDatos respondió ${response.status} para ${year}.`);
  }
  return parseHolidays(await response.json(), year);
}

async function main() {
  const supabase = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
  // shortcut: el año sale de la fecha de la máquina; si corre justo el 31/12 de noche en
  // otra zona puede adelantarse un año, y no pasa nada porque también carga el siguiente.
  const year = new Date().getFullYear();
  const rows = (await Promise.all([fetchYear(year), fetchYear(year + 1)])).flat();

  // Sin feriados no se borra nada: una respuesta vacía por un error de la API vaciaría la tabla.
  if (rows.length === 0) {
    throw new Error(`ArgentinaDatos no trajo feriados para ${year} ni ${year + 1}.`);
  }

  const { error } = await supabase.from("holidays").upsert(rows, { onConflict: "date" });
  if (error) {
    throw new Error(`No pudimos guardar los feriados: ${error.message}`);
  }

  // Saca de esos dos años lo que ya no viene (una fecha vieja de un feriado trasladado).
  const { count, error: deleteError } = await supabase
    .from("holidays")
    .delete({ count: "exact" })
    .gte("date", `${year}-01-01`)
    .lte("date", `${year + 1}-12-31`)
    .not("date", "in", `(${rows.map((row) => row.date).join(",")})`);
  if (deleteError) {
    throw new Error(`No pudimos limpiar los feriados viejos: ${deleteError.message}`);
  }
  console.log(
    `Cargamos ${rows.length} feriados de ${year} y ${year + 1}` +
      (count ? ` y sacamos ${count} que ya no estaban.` : "."),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
