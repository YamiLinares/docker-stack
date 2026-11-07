import "server-only";

/**
 * CRUD de productos para administradores. Todas las peticiones llevan el JWT
 * de la sesión, así que nunca se cachean (apiFetch fuerza no-store). Laravel
 * vuelve a validar los datos y comprueba el rol con ProductPolicy.
 */
import { apiFetch } from "@/lib/api/client";
import type { ProductInput } from "@/lib/validation";
import type { Paginated, Product } from "@/types/api";

export const ADMIN_PAGE_SIZE = 15;

export function listAdminProducts(token: string, page: number, search: string): Promise<Paginated<Product>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(ADMIN_PAGE_SIZE),
    sort: "-created_at",
    include_inactive: "1",
  });
  if (search) params.set("search", search);
  return apiFetch<Paginated<Product>>(`/products?${params.toString()}`, { token });
}

export async function getAdminProduct(token: string, id: number): Promise<Product> {
  return (await apiFetch<{ data: Product }>(`/products/${id}`, { token })).data;
}

export async function createProduct(token: string, input: ProductInput): Promise<Product> {
  return (await apiFetch<{ data: Product }>("/products", { method: "POST", body: input, token })).data;
}

export async function updateProduct(token: string, id: number, input: ProductInput): Promise<Product> {
  return (await apiFetch<{ data: Product }>(`/products/${id}`, { method: "PUT", body: input, token })).data;
}

export function deleteProduct(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE", token });
}
