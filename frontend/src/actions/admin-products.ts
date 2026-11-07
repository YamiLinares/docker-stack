"use server";

/**
 * Server Actions del panel de productos (crear, editar, eliminar).
 *
 * - Se valida con Zod antes de llamar a Laravel; Laravel valida otra vez y
 *   comprueba el rol de administrador (un cliente recibe 403).
 * - Los errores 422 de Laravel (p. ej. SKU duplicado) se muestran por campo.
 * - updateTag("products") hace que el catálogo público muestre el cambio en
 *   la siguiente visita, sin esperar a que caduque la caché de 5 minutos.
 */
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createProduct, deleteProduct, updateProduct } from "@/lib/api/admin-products";
import { ApiError, userMessage } from "@/lib/api/errors";
import { PRODUCTS_TAG } from "@/lib/api/products";
import { getToken, redirectExpired } from "@/lib/auth/session";
import { fieldErrorsOf, productSchema } from "@/lib/validation";
import type { ActionState } from "@/types/action-state";

const LIST_PATH = "/admin/productos";

function readProductForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const fields = {
    sku: text("sku"),
    name: text("name"),
    description: text("description"),
    price: text("price"),
    stock: text("stock"),
    is_active: formData.get("is_active") === "on" ? "on" : "",
  };
  const parsed = productSchema.safeParse({ ...fields, is_active: fields.is_active === "on" });
  return { fields, parsed };
}

async function requireAdminToken(nextPath: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return token;
}

function failure(error: unknown, fields: Record<string, string>, nextPath: string): ActionState {
  if (error instanceof ApiError && error.isUnauthorized) redirectExpired(nextPath);
  if (error instanceof ApiError && error.status === 403) {
    return { status: "error", message: "Tu cuenta no tiene permisos de administrador.", fields };
  }
  return {
    status: "error",
    message: error instanceof ApiError && error.status === 422 ? "Laravel rechazó algunos datos. Revisa los campos marcados." : userMessage(error),
    fieldErrors: error instanceof ApiError ? error.fieldErrors : undefined,
    fields,
  };
}

function refreshCatalog(productId?: number) {
  updateTag(PRODUCTS_TAG);
  if (productId) updateTag(`product-${productId}`);
  revalidatePath(LIST_PATH);
}

export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nextPath = `${LIST_PATH}/nuevo`;
  const token = await requireAdminToken(nextPath);
  const { fields, parsed } = readProductForm(formData);
  if (!parsed.success) return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error), fields };

  let id: number;
  try {
    id = (await createProduct(token, parsed.data)).id;
  } catch (error) {
    return failure(error, fields, nextPath);
  }
  refreshCatalog(id);
  redirect(`${LIST_PATH}?aviso=creado`);
}

export async function updateProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { status: "error", message: "Producto no válido." };
  const nextPath = `${LIST_PATH}/${id}/editar`;
  const token = await requireAdminToken(nextPath);
  const { fields, parsed } = readProductForm(formData);
  if (!parsed.success) return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error), fields };

  try {
    await updateProduct(token, id, parsed.data);
  } catch (error) {
    return failure(error, fields, nextPath);
  }
  refreshCatalog(id);
  redirect(`${LIST_PATH}?aviso=actualizado`);
}

export async function deleteProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { status: "error", message: "Producto no válido." };
  const token = await requireAdminToken(LIST_PATH);

  try {
    await deleteProduct(token, id);
  } catch (error) {
    return failure(error, {}, LIST_PATH);
  }
  refreshCatalog(id);
  return { status: "success", message: "Producto eliminado." };
}
