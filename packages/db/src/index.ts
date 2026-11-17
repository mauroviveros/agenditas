// Tipos generados de Supabase (`types.ts`, con `pnpm db:types`) y validación
// compartida entre panel y web. Los esquemas zod llegan con R1.

export {
  readSupabaseConfig,
  type SupabaseConfig,
  type SupabaseEnvNames,
} from "./supabase-config";
export type { Database, Json } from "./types";
