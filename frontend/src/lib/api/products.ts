import "server-only";

/**
 * Lecturas del catálogo (endpoints públicos).
 *
 * Caché: el catálogo es igual para todos los usuarios, así que se guarda en
 * la caché de datos de Next.js 5 minutos con la etiqueta "products". Cuando
 * una compra cambia el stock, la Server Action llama a updateTag("products")
 * para que el siguiente render use datos frescos. Esto además reduce las
 * llamadas a Laravel (límite de 60 peticiones/minuto por IP).
 */
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { CatalogQuery } from "@/lib/catalog";
import type { Paginated, Product } from "@/types/api";

export const PRODUCTS_TAG = "products";
const CATALOG_REVALIDATE_SECONDS = 300;

export function listProducts(query: CatalogQuery): Promise<Paginated<Product>> {
  const params = new URLSearchParams({ page: String(query.page), per_page: String(query.perPage), sort: query.sort });
  if (query.search) params.set("search", query.search);
  if (query.inStock) params.set("in_stock", "1");

  return apiFetch<Paginated<Product>>(`/products?${params.toString()}`, {
    caching: { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] } },
  });
}

/** Devuelve null si el producto no existe o está inactivo (404 de la API). */
export async function getProduct(id: number): Promise<Product | null> {
  try {
    const response = await apiFetch<{ data: Product }>(`/products/${id}`, {
      caching: { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [PRODUCTS_TAG, `product-${id}`] } },
    });
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
