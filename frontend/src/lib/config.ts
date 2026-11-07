import "server-only";

/**
 * Configuración de SERVIDOR. BASE_URL no lleva el prefijo NEXT_PUBLIC_, así
 * que nunca se incluye en el JavaScript del navegador: el navegador nunca
 * habla directamente con Laravel, solo con este servidor Next.js.
 */
export class ConfigError extends Error {}

export function getApiBaseUrl(): string {
  const raw = process.env.BASE_URL?.trim();
  if (!raw) throw new ConfigError("Falta BASE_URL (URL de la API Laravel). Revisa .env.example.");
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ConfigError("BASE_URL debe usar http o https.");
  }
  return url.toString().replace(/\/$/, "");
}

/** Moneda de la tienda: debe coincidir con STRIPE_CURRENCY del backend. */
export function getStoreCurrency(): string {
  return (process.env.STORE_CURRENCY ?? "USD").trim().toUpperCase();
}

export const isProduction = process.env.NODE_ENV === "production";
