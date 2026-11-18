// Carga los feriados de Argentina del año actual y el siguiente en la tabla `holidays`.
// Uso: `pnpm holidays:sync`. Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del
// entorno (o de .env.local). La clave de servicio se salta la RLS: no se imprime ni se
// versiona. Se corre a mano una vez al año; es idempotente (actualiza por fecha).
import { createClient } from "@supabase/supabase-js";
import { parseHolidays } from "../src/lib/holidays.ts";

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
  const response = await fetch(`${API}/${year}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`ArgentinaDatos respondió ${response.status} para ${year}.`);
  }
  return parseHolidays(await response.json());
}

async function main() {
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
  // shortcut: el año sale de la fecha de la máquina; si corre justo el 31/12 de noche en
  // otra zona puede adelantarse un año, y no pasa nada porque también carga el siguiente.
  const year = new Date().getFullYear();
  const rows = (await Promise.all([fetchYear(year), fetchYear(year + 1)])).flat();

  const { error } = await supabase.from("holidays").upsert(rows, { onConflict: "date" });
  if (error) {
    throw new Error(`No pudimos guardar los feriados: ${error.message}`);
  }
  console.log(`Cargamos ${rows.length} feriados de ${year} y ${year + 1}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
