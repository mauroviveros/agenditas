export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

type RawEnv = Readonly<Record<string, unknown>>;

const SECRET_KEY_PREFIX = "sb_secret_";

function readString(env: RawEnv, name: string): string | undefined {
  const value = env[name];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Valida en el borde: el bundle del navegador es público, así que una clave
// secreta acá se filtraría. Falla al arrancar y con el nombre de la variable.
export function readSupabaseConfig(env: RawEnv): SupabaseConfig {
  const url = readString(env, "VITE_SUPABASE_URL");
  const publishableKey = readString(env, "VITE_SUPABASE_PUBLISHABLE_KEY");

  const missing = [
    url ? null : "VITE_SUPABASE_URL",
    publishableKey ? null : "VITE_SUPABASE_PUBLISHABLE_KEY",
  ].filter((name): name is string => name !== null);

  if (missing.length > 0 || !url || !publishableKey) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }
  if (!isHttpUrl(url)) {
    throw new Error("VITE_SUPABASE_URL tiene que ser una URL http o https");
  }
  if (publishableKey.startsWith(SECRET_KEY_PREFIX)) {
    throw new Error(
      "VITE_SUPABASE_PUBLISHABLE_KEY es una clave secret: usá la publishable",
    );
  }

  return { url, publishableKey };
}
