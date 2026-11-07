"use client";

/**
 * Inicia el pago (Server Action → POST /orders/{id}/payments) al montarse y
 * carga el formulario de Stripe bajo demanda. La Server Action es idempotente
 * en el backend: si la orden ya tiene un PaymentIntent abierto, se reutiliza.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { startPaymentAction, type PaymentStart } from "@/actions/orders";
import { Notice } from "@/components/ui/states";
import { cartActions } from "@/context/cart-store";

const PaymentForm = dynamic(() => import("@/components/checkout/payment-form"), {
  ssr: false,
  loading: () => <PaymentSkeleton />,
});

function PaymentSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Cargando el formulario de pago seguro…</span>
      <div className="h-11 animate-pulse rounded-xl bg-line/70" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-3" aria-hidden="true">
        <div className="h-11 animate-pulse rounded-xl bg-line/70" />
        <div className="h-11 animate-pulse rounded-xl bg-line/70" />
      </div>
      <div className="h-12 animate-pulse rounded-xl bg-line" aria-hidden="true" />
    </div>
  );
}

export function PaymentPanel({ orderId, amountLabel, isNewOrder }: { orderId: number; amountLabel: string; isNewOrder: boolean }) {
  const [result, setResult] = useState<PaymentStart | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // La orden ya existe: el carrito y el intento de compra se cierran.
    if (isNewOrder) {
      cartActions.clear();
      try {
        window.sessionStorage.removeItem("novashop-checkout-id");
      } catch {
        /* sin sessionStorage */
      }
    }
  }, [isNewOrder]);

  const start = () => startTransition(async () => setResult(await startPaymentAction(orderId)));

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (result === null || pending) return <PaymentSkeleton />;

  if (!result.ok) {
    return (
      <div className="space-y-4">
        <Notice tone="error">{result.message}</Notice>
        {result.alreadyProcessed ? (
          <Link href={`/checkout/confirmacion?orden=${orderId}`} className="inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Ver estado de la orden</Link>
        ) : (
          <button type="button" onClick={start} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Reintentar</button>
        )}
      </div>
    );
  }

  return <PaymentForm orderId={orderId} clientSecret={result.clientSecret} publishableKey={result.publishableKey} amountLabel={amountLabel} />;
}
