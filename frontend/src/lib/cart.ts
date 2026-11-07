/**
 * Lógica pura del carrito (sin React): fácil de probar y reutilizable.
 * Límites tomados de StoreOrderRequest de Laravel: máx. 50 líneas y 100 unidades por producto.
 * Los precios guardados son una referencia para mostrar estimaciones; el total
 * definitivo lo calcula siempre el backend.
 */
import { toCents } from "@/lib/money";

export const MAX_LINES = 50;
export const MAX_QUANTITY = 100;

export interface CartLine {
  productId: number;
  name: string;
  sku: string;
  /** Precio unitario de referencia en el momento de agregarlo ("149.99"). */
  price: string;
  /** Stock conocido al agregarlo, para limitar la cantidad en la interfaz. */
  stock: number;
  quantity: number;
}

export type CartProductInput = Omit<CartLine, "quantity">;

export function maxQuantityFor(stock: number): number {
  return Math.max(0, Math.min(MAX_QUANTITY, Math.floor(stock)));
}

export function clampQuantity(quantity: number, stock: number): number {
  const max = maxQuantityFor(stock);
  if (!Number.isFinite(quantity)) return Math.min(1, max);
  return Math.min(max, Math.max(1, Math.floor(quantity)));
}

export function addLine(lines: readonly CartLine[], product: CartProductInput, quantity: number): CartLine[] {
  if (maxQuantityFor(product.stock) === 0) return [...lines];
  const existing = lines.find((line) => line.productId === product.productId);
  if (existing) {
    return lines.map((line) =>
      line.productId === product.productId
        ? { ...line, ...product, quantity: clampQuantity(line.quantity + quantity, product.stock) }
        : line,
    );
  }
  if (lines.length >= MAX_LINES) return [...lines];
  return [...lines, { ...product, quantity: clampQuantity(quantity, product.stock) }];
}

export function setLineQuantity(lines: readonly CartLine[], productId: number, quantity: number): CartLine[] {
  return lines.map((line) => (line.productId === productId ? { ...line, quantity: clampQuantity(quantity, line.stock) } : line));
}

export function removeLine(lines: readonly CartLine[], productId: number): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

export function lineSubtotalCents(line: CartLine): number {
  return toCents(line.price) * line.quantity;
}

export function cartTotals(lines: readonly CartLine[]) {
  return {
    items: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + lineSubtotalCents(line), 0),
  };
}

/** Lo único que se envía al backend: id y cantidad (nunca precios ni totales). */
export function toOrderItems(lines: readonly CartLine[]) {
  return lines.map((line) => ({ product_id: line.productId, quantity: line.quantity }));
}

/** Valida datos leídos de localStorage (pueden estar manipulados o ser de otra versión). */
export function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const lines: CartLine[] = [];
  for (const raw of value.slice(0, MAX_LINES)) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const { productId, name, sku, price, stock, quantity } = item;
    if (
      typeof productId !== "number" || !Number.isInteger(productId) || productId <= 0 || seen.has(productId) ||
      typeof name !== "string" || name.length === 0 || name.length > 200 ||
      typeof sku !== "string" || sku.length > 50 ||
      typeof price !== "string" || !/^\d+(\.\d{1,2})?$/.test(price) ||
      typeof stock !== "number" || typeof quantity !== "number"
    ) {
      continue;
    }
    const clamped = clampQuantity(quantity, stock);
    if (clamped === 0) continue;
    seen.add(productId);
    lines.push({ productId, name, sku, price, stock, quantity: clamped });
  }
  return lines;
}
