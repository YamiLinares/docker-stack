import "server-only";

/**
 * Endpoints privados de órdenes y pagos (requieren JWT).
 * Todas estas peticiones son cache: "no-store" (lo fuerza apiFetch al llevar
 * token): los datos de un usuario nunca entran en una caché compartida.
 * La API comprueba con políticas (OrderPolicy) que la orden sea del usuario.
 */
import { apiFetch } from "@/lib/api/client";
import type { Order, Paginated, PaymentStartResponse } from "@/types/api";

export function listOrders(token: string, page = 1) {
  return apiFetch<Paginated<Order>>(`/orders?page=${page}&per_page=20`, { token });
}

export async function getOrder(token: string, id: number) {
  return (await apiFetch<{ data: Order }>(`/orders/${id}`, { token })).data;
}

export async function createOrder(token: string, items: { product_id: number; quantity: number }[]) {
  return (await apiFetch<{ data: Order }>("/orders", { method: "POST", token, body: { items } })).data;
}

export async function cancelOrder(token: string, id: number) {
  return (await apiFetch<{ data: Order }>(`/orders/${id}/cancel`, { method: "POST", token })).data;
}

/** Crea (o reutiliza) el PaymentIntent de Stripe para la orden; idempotente en el backend. */
export async function startPayment(token: string, id: number) {
  return (await apiFetch<PaymentStartResponse>(`/orders/${id}/payments`, { method: "POST", token, body: {} })).data;
}
