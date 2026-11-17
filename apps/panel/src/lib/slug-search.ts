import { slugWithSuffix } from "@agenditas/db";

const MAX_NUMBERED_VARIANTS = 5;

// Devuelve el slug si está libre o el primer `-2`, `-3`… libre. `null` si ninguno.
export async function findFreeSlug(
  slug: string,
  isAvailable: (candidate: string) => Promise<boolean>,
): Promise<string | null> {
  if (await isAvailable(slug)) return slug;
  for (let n = 2; n <= MAX_NUMBERED_VARIANTS; n += 1) {
    const candidate = slugWithSuffix(slug, n);
    if (await isAvailable(candidate)) return candidate;
  }
  return null;
}
