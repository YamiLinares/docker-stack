/**
 * Lógica pura del catálogo: parámetros de búsqueda y familias de producto.
 * Los valores permitidos replican la validación del backend
 * (IndexProductRequest::SORTABLE, per_page ≤ 100, search ≤ 100).
 */

export const SORT_OPTIONS = [
  { value: "name", label: "Nombre (A–Z)" },
  { value: "-name", label: "Nombre (Z–A)" },
  { value: "price", label: "Precio: menor a mayor" },
  { value: "-price", label: "Precio: mayor a menor" },
  { value: "-created_at", label: "Más recientes" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface CatalogQuery {
  page: number;
  perPage: number;
  search: string;
  sort: SortValue;
  inStock: boolean;
}

export const CATALOG_PAGE_SIZE = 12;

type Raw = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseCatalogQuery(params: Raw): CatalogQuery {
  const page = Number(first(params.page));
  const sort = first(params.sort);
  return {
    page: Number.isInteger(page) && page >= 1 && page <= 1000 ? page : 1,
    perPage: CATALOG_PAGE_SIZE,
    search: (first(params.q) ?? "").trim().slice(0, 100),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : "name",
    inStock: first(params.stock) === "1",
  };
}

export function catalogHref(query: Partial<CatalogQuery>): string {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.sort && query.sort !== "name") params.set("sort", query.sort);
  if (query.inStock) params.set("stock", "1");
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/productos?${qs}` : "/productos";
}

/** Familia derivada del prefijo real del SKU (convención del seeder del backend). */
const FAMILIES: Record<string, { label: string; tone: string }> = {
  TEC: { label: "Tecnología", tone: "tech" },
  HOG: { label: "Hogar", tone: "home" },
  DEP: { label: "Deporte", tone: "sport" },
  LIB: { label: "Libros", tone: "books" },
  ACC: { label: "Accesorios", tone: "accessories" },
};

export function productFamily(sku: string): { label: string; tone: string } {
  return FAMILIES[sku.slice(0, 3).toUpperCase()] ?? { label: "General", tone: "general" };
}

/** Valida el id de la ruta /productos/[id]. */
export function parseProductId(value: string): number | null {
  return /^[1-9]\d{0,9}$/.test(value) ? Number(value) : null;
}
