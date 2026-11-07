import "server-only";

/**
 * Sesión del frontend: el JWT que emite Laravel (POST /auth/login|register)
 * se guarda en una cookie httpOnly. El navegador nunca puede leerlo con
 * JavaScript; solo el servidor Next.js lo usa para llamar a la API.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth/session-cookie";
import { isProduction } from "@/lib/config";
import { safeNextPath } from "@/lib/security/redirect";
import type { User } from "@/types/api";

export { TOKEN_COOKIE, USER_COOKIE };

export interface SessionUser {
  name: string;
  email: string;
}

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

/** Solo en Server Actions o Route Handlers (únicos contextos que pueden escribir cookies). */
export async function setSession(token: string, expiresInSeconds: number, user: User) {
  const store = await cookies();
  // La cookie caduca a la vez que el token (TTL del JWT en Laravel).
  const maxAge = Math.max(60, Math.min(expiresInSeconds, 60 * 60 * 24 * 7));
  store.set(TOKEN_COOKIE, token, { ...baseCookie, maxAge });
  // Solo datos de presentación; la autorización siempre depende del token y de Laravel.
  store.set(USER_COOKIE, JSON.stringify({ name: user.name, email: user.email } satisfies SessionUser), { ...baseCookie, maxAge });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  if (!store.get(TOKEN_COOKIE)) return null;
  try {
    const parsed = JSON.parse(store.get(USER_COOKIE)?.value ?? "") as Partial<SessionUser>;
    return typeof parsed.name === "string" && typeof parsed.email === "string" ? { name: parsed.name, email: parsed.email } : null;
  } catch {
    return null;
  }
}

/** Páginas privadas: exige token; sin él, al login con regreso a la página actual. */
export async function requireToken(nextPath: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  return token;
}

/**
 * La API respondió 401 (token caducado o invalidado): un Server Component no
 * puede borrar cookies, así que se delega en un Route Handler que las elimina
 * y lleva al login.
 */
export function redirectExpired(nextPath: string): never {
  redirect(`/api/auth/expired?next=${encodeURIComponent(safeNextPath(nextPath))}`);
}
