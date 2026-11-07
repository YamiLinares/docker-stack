"use server";

/**
 * Mutaciones asíncronas en el servidor (Server Actions).
 *
 * Reglas comunes:
 * - Se valida la entrada con Zod y se exige sesión (cookie httpOnly).
 * - Solo se envían ids y cantidades: los precios y totales los calcula Laravel.
 * - Un 401 de la API borra la sesión y lleva al login (sesión vencida).
 * - Invalidación de caché:
 *     · updateTag("products"): crear o cancelar una orden cambia el stock, y
 *       el usuario debe ver el inventario actualizado de inmediato.
 *     · revalidatePath("/mis-compras"): el historial privado se vuelve a pedir.
 */
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, userMessage } from "@/lib/api/errors";
import { cancelOrder, createOrder, startPayment } from "@/lib/api/orders";
import { PRODUCTS_TAG, getProduct } from "@/lib/api/products";
import { getToken, redirectExpired } from "@/lib/auth/session";
import { isProduction } from "@/lib/config";
import { checkoutIdSchema, orderItemsSchema } from "@/lib/validation";
import type { ActionState } from "@/types/action-state";

const CHECKOUT_COOKIE = "nova_checkout";

async function requireSessionToken(nextPath: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return token;
}

function describeOrderError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "INSUFFICIENT_STOCK") {
      const available = error.details.available;
      return `${error.message}${typeof available === "number" ? ` Disponibles: ${available}.` : ""} Ajusta la cantidad en tu carrito.`;
    }
    if (error.code === "VALIDATION_ERROR") {
      return "Algún producto del carrito ya no está disponible. Revisa tu carrito e inténtalo de nuevo.";
    }
  }
  return userMessage(error);
}

/** Confirma el carrito: crea la orden en Laravel y lleva al pago. */
export async function createOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await requireSessionToken("/checkout");

  const checkoutId = checkoutIdSchema.safeParse(formData.get("checkoutId"));
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    rawItems = null;
  }
  const items = orderItemsSchema.safeParse(rawItems);
  if (!checkoutId.success || !items.success) {
    return { status: "error", message: items.success ? "Solicitud no válida. Recarga la página." : (items.error.issues[0]?.message ?? "Carrito no válido.") };
  }

  // Evita órdenes duplicadas por doble clic, recarga o reenvío del formulario:
  // si este intento de compra ya creó una orden, se continúa con esa misma.
  const store = await cookies();
  const [previousId, previousOrder] = (store.get(CHECKOUT_COOKIE)?.value ?? "").split(":");
  if (previousId === checkoutId.data && /^\d+$/.test(previousOrder ?? "")) {
    redirect(`/checkout/pagar/${previousOrder}?nuevo=1`);
  }

  let orderId: number;
  try {
    orderId = (await createOrder(token, items.data)).id;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired("/checkout");
    return { status: "error", message: describeOrderError(error) };
  }

  store.set(CHECKOUT_COOKIE, `${checkoutId.data}:${orderId}`, { httpOnly: true, secure: isProduction, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  updateTag(PRODUCTS_TAG);
  revalidatePath("/mis-compras");
  redirect(`/checkout/pagar/${orderId}?nuevo=1`);
}

export type PaymentStart =
  | { ok: true; clientSecret: string; publishableKey: string }
  | { ok: false; message: string; alreadyProcessed?: boolean };

/** Pide a Laravel el PaymentIntent (reutiliza el existente si la orden ya tiene uno abierto). */
export async function startPaymentAction(orderId: number): Promise<PaymentStart> {
  if (!Number.isInteger(orderId) || orderId <= 0) return { ok: false, message: "Orden no válida." };
  const token = await requireSessionToken(`/checkout/pagar/${orderId}`);

  try {
    const result = await startPayment(token, orderId);
    if (!result.client_secret || !result.publishable_key) {
      return { ok: false, message: "El proveedor de pagos no devolvió los datos necesarios. Inténtalo más tarde." };
    }
    return { ok: true, clientSecret: result.client_secret, publishableKey: result.publishable_key };
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired(`/checkout/pagar/${orderId}`);
    if (error instanceof ApiError && error.code === "ORDER_NOT_PAYABLE") {
      return { ok: false, message: "Esta orden ya no admite pagos.", alreadyProcessed: true };
    }
    return { ok: false, message: userMessage(error) };
  }
}

export async function cancelOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = Number(formData.get("orderId"));
  if (!Number.isInteger(orderId) || orderId <= 0) return { status: "error", message: "Orden no válida." };
  const token = await requireSessionToken(`/mis-compras/${orderId}`);

  try {
    await cancelOrder(token, orderId);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired(`/mis-compras/${orderId}`);
    return { status: "error", message: userMessage(error) };
  }
  // Cancelar devuelve el stock reservado.
  updateTag(PRODUCTS_TAG);
  revalidatePath("/mis-compras");
  revalidatePath(`/mis-compras/${orderId}`);
  return { status: "success", message: "Orden cancelada. El stock reservado se liberó." };
}

export interface QuotedLine {
  productId: number;
  available: boolean;
  name: string;
  price: string;
  stock: number;
}

/**
 * Revalida el carrito con el catálogo actual (precio y stock reales).
 * Usa las lecturas cacheadas del catálogo, así que no satura la API.
 */
export async function quoteCartAction(productIds: number[]): Promise<QuotedLine[]> {
  const ids = [...new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))].slice(0, 50);
  return Promise.all(
    ids.map(async (id) => {
      const product = await getProduct(id).catch(() => null);
      return product
        ? { productId: id, available: product.is_active && product.stock > 0, name: product.name, price: product.price, stock: product.stock }
        : { productId: id, available: false, name: "", price: "0.00", stock: 0 };
    }),
  );
}
