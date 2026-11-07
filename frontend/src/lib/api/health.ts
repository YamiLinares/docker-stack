import "server-only";

/**
 * Consulta GET /api/health de Laravel desde el servidor Next.js (red interna
 * de Docker). No usa apiFetch porque aquí un 503 no es un error de la
 * página sino un dato: indica que Laravel responde pero MySQL no.
 */
import { getApiBaseUrl } from "@/lib/config";

export interface BackendHealth {
  status: "ok" | "degraded";
  service: string;
  database: { status: "ok" | "unavailable"; driver: string; latency_ms: number | null; products: number | null };
  checked_at: string;
}

export type HealthCheck =
  | { reachable: true; httpStatus: number; latencyMs: number; body: BackendHealth | null }
  | { reachable: false; reason: string };

export async function checkBackend(): Promise<HealthCheck> {
  let url: string;
  try {
    url = `${getApiBaseUrl()}/health`;
  } catch (error) {
    return { reachable: false, reason: error instanceof Error ? error.message : "Configuración no válida." };
  }

  const start = performance.now();
  try {
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
    const latencyMs = Math.round(performance.now() - start);
    const body = (await response.json().catch(() => null)) as BackendHealth | null;
    return { reachable: true, httpStatus: response.status, latencyMs, body };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return { reachable: false, reason: timedOut ? "La API no respondió en 5 segundos." : "No se pudo abrir la conexión con la API." };
  }
}

/** Host interno al que llama este servidor (p. ej. "nginx:8000"). No contiene credenciales. */
export function internalApiHost(): string | null {
  try {
    return new URL(getApiBaseUrl()).host;
  } catch {
    return null;
  }
}
