"use client";

/**
 * Carrito: cantidades, eliminación, subtotales y total estimado.
 * Al abrirlo se revalidan precio y stock con el catálogo real (Server Action
 * quoteCartAction): si cambiaron, se actualizan y se avisa al usuario.
 */
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { quoteCartAction } from "@/actions/orders";
import { ProductPhoto } from "@/components/product/product-photo";
import { Notice } from "@/components/ui/states";
import { cartActions, useCart, useCartReady } from "@/context/cart-store";
import { lineSubtotalCents, maxQuantityFor } from "@/lib/cart";
import { formatCents, formatMoney } from "@/lib/money";

export function CartView({ currency }: { currency: string }) {
  const ready = useCartReady();
  const { lines, items, subtotalCents } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [checking, startChecking] = useTransition();
  const idsKey = lines.map((line) => line.productId).join(",");

  useEffect(() => {
    if (!idsKey) return;
    startChecking(async () => {
      const quotes = await quoteCartAction(idsKey.split(",").map(Number));
      const changes: string[] = [];
      for (const quote of quotes) {
        const line = lines.find((l) => l.productId === quote.productId);
        if (!line) continue;
        if (!quote.available) {
          cartActions.remove(quote.productId);
          changes.push(`«${line.name}» ya no está disponible y se quitó del carrito.`);
        } else if (quote.price !== line.price || quote.stock !== line.stock) {
          cartActions.add({ productId: line.productId, name: quote.name, sku: line.sku, price: quote.price, stock: quote.stock }, 0);
          if (quote.price !== line.price) changes.push(`El precio de «${quote.name}» cambió a ${formatMoney(quote.price, currency)}.`);
          if (line.quantity > quote.stock) changes.push(`Solo quedan ${quote.stock} unidades de «${quote.name}».`);
        }
      }
      setNotice(changes.length > 0 ? changes.join(" ") : null);
    });
    // Solo al abrir el carrito o al cambiar los productos (no las cantidades).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  if (!ready) {
    // Mismo esquema que el carrito real (línea + resumen) para que, al leer
    // localStorage, el contenido ocupe el espacio ya reservado (sin CLS).
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-2xl bg-surface shadow-card sm:h-28" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface shadow-card" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-ink">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-ink-muted">Explora el catálogo y agrega los productos que te interesen.</p>
        <Link href="/productos" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        {notice && <Notice tone="warning">{notice}</Notice>}
        <ul className="space-y-3">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 rounded-2xl border border-line bg-surface p-3 shadow-card sm:p-4">
              <div className="w-20 shrink-0 overflow-hidden rounded-xl sm:w-24">
                <ProductPhoto sku={line.sku} name={line.name} sizes="96px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/productos/${line.productId}`} className="font-semibold text-ink hover:text-brand-600">{line.name}</Link>
                  <p className="text-sm text-ink-muted">{formatMoney(line.price, currency)} c/u · SKU {line.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`qty-${line.productId}`}>Cantidad de {line.name}</label>
                  <select
                    id={`qty-${line.productId}`}
                    value={line.quantity}
                    onChange={(event) => cartActions.setQuantity(line.productId, Number(event.target.value))}
                    className="h-10 rounded-lg border border-line bg-surface px-2 text-sm font-semibold text-ink"
                  >
                    {Array.from({ length: Math.max(1, Math.min(maxQuantityFor(line.stock), 20)) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <p className="w-24 text-right font-semibold text-ink">{formatCents(lineSubtotalCents(line), currency)}</p>
                  <button type="button" onClick={() => cartActions.remove(line.productId)} className="rounded-lg px-2 py-1 text-sm font-semibold text-danger hover:bg-red-50" aria-label={`Quitar ${line.name}`}>
                    Quitar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card lg:sticky lg:top-24" aria-labelledby="resumen">
        <h2 id="resumen" className="font-display text-lg font-bold text-ink">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-ink-muted">Artículos</dt><dd className="font-semibold text-ink">{items}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-semibold text-ink">Total estimado</dt><dd className="font-bold text-ink">{formatCents(subtotalCents, currency)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-ink-muted">
          {checking ? "Verificando precios y stock…" : "El importe final lo confirma el servidor al crear tu orden."}
        </p>
        <Link href="/checkout" className="mt-5 flex h-12 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700">
          Continuar con la compra
        </Link>
        <Link href="/productos" className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700">Seguir comprando</Link>
      </aside>
    </div>
  );
}
