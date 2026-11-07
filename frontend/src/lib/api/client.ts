import "server-only";

/**
 * Único punto de comunicación con la API Laravel (solo servidor).
 * - Añade Accept/Content-Type JSON y el token Bearer cuando se proporciona.
 * - Aplica un tiempo límite para no bloquear el renderizado.
 * - Convierte errores HTTP y de red en ApiError.
 * - Nunca registra tokens, contraseñas ni cuerpos de petición.
 */
import { getApiBaseUrl } from "@/lib/config";
import { ApiError, toApiError } from "@/lib/api/errors";
import type { ApiErrorBody } from "@/types/api";

const TIMEOUT_MS = 10_000;

type CacheOptions =
  | { cache: "no-store" }
  | { next: { revalidate: number; tags?: string[] } };

export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  /** Política de caché explícita. Las peticiones con token son SIEMPRE no-store. */
  caching?: CacheOptions;
}

export async function apiFetch<T>(path: string, { method = "GET", body, token, caching }: ApiRequest = {}): Promise<T> {
  if (!path.startsWith("/") || path.includes("..")) throw new Error("Ruta de API inválida.");
  const url = `${getApiBaseUrl()}${path}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  // Los datos que dependen del usuario nunca se guardan en la caché compartida.
  const cacheInit: RequestInit = token || method !== "GET" ? { cache: "no-store" } : (caching ?? { cache: "no-store" });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...cacheInit,
    });
  } catch (error) {
    console.error(`[api] ${method} ${path} sin respuesta`, error instanceof Error ? error.name : "error");
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con la API.");
  }

  if (response.status === 204) return undefined as T;

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    if (response.status >= 500) console.error(`[api] ${method} ${path} → ${response.status}`);
    throw toApiError(response.status, json as ApiErrorBody | null);
  }
  return json as T;
}
