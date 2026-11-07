/**
 * Confirmación de compra. Muestra el estado REAL de la orden según Laravel:
 * la redirección desde el formulario (o los parámetros que añade Stripe a la
 * URL) no prueban que el pago se haya confirmado. Solo "paid" —que el backend
 * asigna al recibir el webhook firmado payment_intent.succeeded— es un éxito.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { AwaitConfirmation } from "@/components/checkout/await-confirmation";
import { OrderItems } from "@/components/orders/order-items";
import { OrderStatusBadge, formatDate } from "@/components/orders/order-status";
import { Notice } from "@/components/ui/states";
import { loadOwnOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Confirmación", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: PageProps<"/checkout/confirmacion">) {
  const { orden } = await searchParams;
  const rawId = typeof orden === "string" ? orden : undefined;
  const { order } = await loadOwnOrder(rawId, `/checkout/confirmacion?orden=${rawId ?? ""}`);
  // El intento de pago más reciente (la API no garantiza el orden de la lista).
  const lastPayment = [...(order.payments ?? [])].sort((a, b) => b.id - a.id)[0];
  const paid = ["paid", "shipped", "delivered"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-muted">Orden #{order.id}</p>
          <OrderStatusBadge status={order.status} />
        </div>

        {paid && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink">¡Pago confirmado!</h1>
            <p className="mt-2 text-ink-muted">Stripe confirmó el cobro el {formatDate(order.paid_at)}. Te avisaremos cuando enviemos tu pedido.</p>
          </>
        )}
        {order.status === "pending" && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink">Estamos confirmando tu pago</h1>
            <div className="mt-3 space-y-3">
              {lastPayment?.status === "failed" ? (
                <Notice tone="error">
                  El último intento de pago fue rechazado{lastPayment.failure_message ? `: ${lastPayment.failure_message}` : "."}{" "}
                  <Link href={`/checkout/pagar/${order.id}`} className="font-semibold underline">Intentar de nuevo</Link>
                </Notice>
              ) : lastPayment ? (
                <AwaitConfirmation />
              ) : (
                <Notice tone="warning">
                  Esta orden todavía no tiene un pago. <Link href={`/checkout/pagar/${order.id}`} className="font-semibold underline">Ir al pago</Link>
                </Notice>
              )}
            </div>
          </>
        )}
        {order.status === "cancelled" && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink">Orden cancelada</h1>
            <p className="mt-2 text-ink-muted">Esta orden se canceló el {formatDate(order.cancelled_at)} y no se realizó ningún cobro.</p>
          </>
        )}

        <div className="mt-8">
          <OrderItems order={order} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/mis-compras/${order.id}`} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900">Ver detalle</Link>
          <Link href="/productos" className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
