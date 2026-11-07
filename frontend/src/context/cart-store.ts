"use client";

/**
 * Estado del carrito en el navegador (store externo + useSyncExternalStore).
 *
 * - Persistencia en localStorage ("novashop-cart-v1"): solo id, nombre, SKU,
 *   precio de referencia, stock y cantidad. Nunca tokens ni datos personales.
 * - Hidratación: en el servidor y en el primer render del cliente el carrito
 *   está vacío (getServerSnapshot); después se lee localStorage. Así no hay
 *   diferencias entre el HTML del servidor y el del cliente.
 * - Se sincroniza entre pestañas con el evento "storage".
 */
import { useSyncExternalStore } from "react";
import { addLine, cartTotals, removeLine, sanitizeLines, setLineQuantity, type CartLine, type CartProductInput } from "@/lib/cart";

const STORAGE_KEY = "novashop-cart-v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = sanitizeLines(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    lines = EMPTY;
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Almacenamiento lleno o bloqueado: el carrito sigue funcionando en memoria.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      lines = sanitizeLines(JSON.parse(event.newValue ?? "[]"));
    } catch {
      lines = EMPTY;
    }
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return lines;
}

const getServerSnapshot = () => EMPTY;

export const cartActions = {
  add: (product: CartProductInput, quantity: number) => commit(addLine(getSnapshot(), product, quantity)),
  setQuantity: (productId: number, quantity: number) => commit(setLineQuantity(getSnapshot(), productId, quantity)),
  remove: (productId: number) => commit(removeLine(getSnapshot(), productId)),
  clear: () => commit(EMPTY),
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { lines: current, ...cartTotals(current) };
}

/** true después de hidratar (para no mostrar «carrito vacío» antes de leer localStorage). */
export function useCartReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
