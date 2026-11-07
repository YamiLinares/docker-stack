/**
 * Error tipado de la API. Conserva el código HTTP y el código de negocio de
 * Laravel (p. ej. INSUFFICIENT_STOCK) para decidir qué mostrar al usuario,
 * sin exponer detalles internos.
 */
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;
  readonly details: Record<string, unknown>;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[]> = {}, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNetwork() {
    return this.status === 0;
  }
}

/** Convierte la respuesta de error de Laravel en ApiError. */
export function toApiError(status: number, body: ApiErrorBody | null): ApiError {
  const fieldErrors: Record<string, string[]> = {};
  const details: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body?.errors ?? {})) {
    if (Array.isArray(value)) fieldErrors[key] = value.map(String);
    else details[key] = value;
  }
  return new ApiError(status, body?.code ?? `HTTP_${status}`, body?.message ?? "Error inesperado.", fieldErrors, details);
}

/** Mensaje comprensible para el usuario según el error. */
export function userMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  if (error.isNetwork) return "No pudimos conectar con la tienda. Revisa tu conexión o inténtalo en unos minutos.";
  if (error.status === 429) return "Demasiadas solicitudes en poco tiempo. Espera un momento e inténtalo de nuevo.";
  if (error.status >= 500 && error.code !== "PAYMENTS_NOT_CONFIGURED" && error.code !== "PAYMENT_GATEWAY_ERROR") {
    return "La tienda no está disponible en este momento. Inténtalo más tarde.";
  }
  // Los mensajes de negocio de la API están pensados para el usuario final (en español).
  return error.message;
}
