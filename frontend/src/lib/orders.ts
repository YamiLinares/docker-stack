import "server-only";

/**
 * Carga de una orden para páginas privadas, con el tratamiento común de errores:
 * id inválido u orden ajena/inexistente → 404; 401 → sesión vencida.
 * Laravel (OrderPolicy) impide ver órdenes de otro usuario aunque se cambie el id.
 */
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { getOrder } from "@/lib/api/orders";
import { redirectExpired, requireToken } from "@/lib/auth/session";
import type { Order } from "@/types/api";

export async function loadOwnOrder(rawId: string | undefined, path: string): Promise<{ order: Order; token: string }> {
  const token = await requireToken(path);
  const id = rawId && /^[1-9]\d{0,9}$/.test(rawId) ? Number(rawId) : null;
  if (id === null) notFound();
  try {
    return { order: await getOrder(token, id), token };
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired(path);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }
}
