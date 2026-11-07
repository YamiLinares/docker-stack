/**
 * Destinos de redirección permitidos (evita redirecciones abiertas):
 * solo rutas internas de esta lista. Cualquier otro valor usa el destino por defecto.
 */
const ALLOWED_PREFIXES = ["/checkout", "/mis-compras", "/carrito", "/productos", "/admin"] as const;

export function safeNextPath(value: unknown, fallback = "/mis-compras"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 200) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  let url: URL;
  try {
    url = new URL(value, "http://internal.invalid");
  } catch {
    return fallback;
  }
  if (url.origin !== "http://internal.invalid") return fallback;
  const ok = ALLOWED_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
  return ok ? `${url.pathname}${url.search}` : fallback;
}
