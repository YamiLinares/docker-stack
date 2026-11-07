"use client";

/**
 * Confirmación del carrito. Envía a la Server Action solo ids y cantidades,
 * junto con un identificador del intento de compra (checkoutId) que se
 * conserva en sessionStorage: si el usuario recarga o reenvía, el servidor
 * reconoce el intento y no crea una segunda orden.
 */
import Link from "next/link";
import { useActionState, useState } from "react";
import { createOrderAction } from "@/actions/orders";
import { SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/states";
import { useCart, useCartReady } from "@/context/cart-store";
import { lineSubtotalCents, toOrderItems } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import { IDLE } from "@/types/action-state";

const CHECKOUT_KEY = "novashop-checkout-id";

function getCheckoutId(): string {
  try {
    const existing = window.sessionStorage.getItem(CHECKOUT_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(CHECKOUT_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function CheckoutForm({ currency }: { currency: string }) {
  const ready = useCartReady();
  const { lines, items, subtotalCents } = useCart();
  const [state, action] = useActionState(createOrderAction, IDLE);
  const [checkoutId] = useState(() => (typeof window === "undefined" ? "" : getCheckoutId()));

  if (!ready) return <div className="h-72 animate-pulse rounded-2xl bg-surface shadow-card" aria-hidden="true" />;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-ink">No hay productos para comprar</p>
        <p className="mt-2 text-sm text-ink-muted">Agrega productos al carrito para continuar.</p>
        <Link href="/productos" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="items" value={JSON.stringify(toOrderItems(lines))} />
      <input type="hidden" name="checkoutId" value={checkoutId} />

      <section aria-labelledby="productos-orden" className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 id="productos-orden" className="font-display text-lg font-bold text-ink">Productos</h2>
        <ul className="mt-4 divide-y divide-line">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-ink">
                {line.name} <span className="text-ink-muted">× {line.quantity}</span>
              </span>
              <span className="font-semibold text-ink">{formatCents(lineSubtotalCents(line), currency)}</span>
            </li>
          ))}
        </ul>
        <Link href="/carrito" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">Modificar carrito</Link>
      </section>

      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-ink">Confirmar orden</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-ink-muted">Artículos</dt><dd className="font-semibold">{items}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base"><dt className="font-semibold">Total estimado</dt><dd className="font-bold">{formatCents(subtotalCents, currency)}</dd></div>
        </dl>
        {state.status === "error" && <Notice tone="error">{state.message}</Notice>}
        <SubmitButton pendingLabel="Creando orden…">Crear orden y pagar</SubmitButton>
        <p className="text-xs text-ink-muted">Al confirmar se reserva el stock y el servidor calcula el importe definitivo. Después pagarás con tarjeta mediante Stripe.</p>
      </aside>
    </form>
  );
}
