"use client";

/**
 * Selector de cantidad + «Agregar al carrito». La actualización es local e
 * inmediata (buena INP): no hay viaje al servidor al agregar.
 */
import Link from "next/link";
import { useState } from "react";
import { cartActions, useCart } from "@/context/cart-store";
import { maxQuantityFor, type CartProductInput } from "@/lib/cart";

export function AddToCart({ product }: { product: CartProductInput }) {
  const { lines } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = lines.find((line) => line.productId === product.productId)?.quantity ?? 0;
  const max = Math.max(0, maxQuantityFor(product.stock) - inCart);

  if (maxQuantityFor(product.stock) === 0) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-danger">Producto agotado. Vuelve a consultarlo más tarde.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="cantidad" className="text-sm font-semibold text-ink">Cantidad</label>
        <div className="flex items-center rounded-xl border border-line bg-surface">
          <button type="button" className="h-11 w-11 text-lg text-ink disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Disminuir cantidad">−</button>
          <input
            id="cantidad"
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(1, max)}
            value={quantity}
            onChange={(event) => setQuantity(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, max)))}
            className="h-11 w-14 border-x border-line bg-transparent text-center font-semibold text-ink [appearance:textfield] focus:outline-none"
          />
          <button type="button" className="h-11 w-11 text-lg text-ink disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(max, q + 1))} disabled={quantity >= max} aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={max === 0}
          onClick={() => {
            cartActions.add(product, Math.min(quantity, max));
            setQuantity(1);
            setAdded(true);
          }}
          className="h-12 flex-1 rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {max === 0 ? "Ya tienes el máximo disponible" : "Agregar al carrito"}
        </button>
        {inCart > 0 && (
          <Link href="/carrito" className="inline-flex h-12 items-center rounded-xl border border-line px-5 font-semibold text-ink hover:bg-canvas">
            Ver carrito ({inCart})
          </Link>
        )}
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-success">
        {added ? "Producto agregado al carrito." : ""}
      </p>
    </div>
  );
}
