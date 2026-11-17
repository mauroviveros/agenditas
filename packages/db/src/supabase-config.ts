export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

// Cada app usa sus propios nombres (VITE_… en el panel, sin prefijo en el Worker).
export interface SupabaseEnvNames {
  url: string;
  publishableKey: string;
}

const SECRET_KEY_PREFIX = "sb_secret_";

function readString(env: object, name: string): string | undefined {
  const value = (env as Record<string, unknown>)[name];
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

// Valida en el borde: una clave secreta en el bundle del navegador se filtraría.
// Falla al arrancar y con el nombre de la variable.
export function readSupabaseConfig(
  env: object,
  names: SupabaseEnvNames,
): SupabaseConfig {
  const url = readString(env, names.url);
  const publishableKey = readString(env, names.publishableKey);

  const missing = [
    url ? null : names.url,
    publishableKey ? null : names.publishableKey,
  ].filter((name): name is string => name !== null);

  if (missing.length > 0 || !url || !publishableKey) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }
  if (!isHttpUrl(url)) {
    throw new Error(`${names.url} tiene que ser una URL http o https`);
  }
  if (publishableKey.startsWith(SECRET_KEY_PREFIX)) {
    throw new Error(
      `${names.publishableKey} es una clave secret: usá la publishable`,
    );
  }

  return { url, publishableKey };
}
