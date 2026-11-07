import "server-only";

/**
 * Acceso al panel de administración. El rol se consulta a Laravel con el JWT
 * en cada carga (GET /auth/me); la cookie de presentación no se usa para
 * autorizar. Aunque esta comprobación fallara, Laravel rechazaría con 403
 * cualquier escritura de un usuario que no sea administrador.
 */
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { redirectExpired, requireToken } from "@/lib/auth/session";
import type { User } from "@/types/api";

export type AdminAccess = { ok: true; token: string; user: User } | { ok: false; reason: "forbidden" };

export async function requireAdmin(nextPath: string): Promise<AdminAccess> {
  const token = await requireToken(nextPath);
  let user: User;
  try {
    user = (await apiFetch<{ data: User }>("/auth/me", { token })).data;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired(nextPath);
    throw error;
  }
  return user.role === "admin" ? { ok: true, token, user } : { ok: false, reason: "forbidden" };
}
