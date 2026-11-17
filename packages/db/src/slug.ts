const MAX_SLUG_LENGTH = 40;

// Misma regla que `public.is_valid_slug`, que es la que manda: esto solo propone.
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

// Para cuando el slug propuesto está tomado: `barberia-ceibo-2`.
export function slugWithSuffix(slug: string, n: number): string {
  const suffix = `-${n}`;
  return (
    slug.slice(0, MAX_SLUG_LENGTH - suffix.length).replace(/-+$/g, "") + suffix
  );
}
