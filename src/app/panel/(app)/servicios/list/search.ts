// Sin acentos ni mayúsculas, como se busca en castellano: «raiz» encuentra «Raíz».
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Si el nombre contiene lo que se escribió. Una búsqueda vacía deja pasar todo.
export function matchesQuery(name: string, query: string): boolean {
  return normalize(name).includes(normalize(query));
}
