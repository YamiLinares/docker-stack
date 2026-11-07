import type { Metadata } from "next";
import Link from "next/link";
import { CancelOrder } from "@/components/orders/cancel-order";
import { OrderItems } from "@/components/orders/order-items";
import { OrderStatusBadge, formatDate } from "@/components/orders/order-status";
import { formatMoney } from "@/lib/money";
import { loadOwnOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Detalle de compra", robots: { index: false } };

const PAYMENT_LABEL: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  succeeded: "Confirmado",
  failed: "Rechazado",
  canceled: "Cancelado",
};

/** Detalle privado. Cambiar el id en la URL no expone órdenes ajenas: Laravel responde 403 y se muestra 404. */
export default async function OrderDetailPage({ params }: PageProps<"/mis-compras/[id]">) {
  const { id } = await params;
  const { order } = await loadOwnOrder(id, `/mis-compras/${id}`);
  const payments = [...(order.payments ?? [])].sort((a, b) => b.id - a.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/mis-compras" className="text-sm font-semibold text-brand-600 hover:text-brand-700">← Mis compras</Link>
      <div className="mt-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">Orden #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-ink-muted">Creada el {formatDate(order.created_at)}{order.paid_at ? ` · pagada el ${formatDate(order.paid_at)}` : ""}</p>

        <div className="mt-6"><OrderItems order={order} /></div>

        <section aria-labelledby="pagos" className="mt-8">
          <h2 id="pagos" className="font-display text-lg font-bold text-ink">Pagos</h2>
          {payments.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Sin intentos de pago.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-canvas px-4 py-3">
                  <span>Stripe · {formatDate(payment.created_at)}</span>
                  <span className="font-semibold">{PAYMENT_LABEL[payment.status] ?? payment.status} · {formatMoney(payment.amount, payment.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {order.status === "pending" && (
          <div className="mt-8 flex flex-wrap items-start gap-3 border-t border-line pt-6">
            <Link href={`/checkout/pagar/${order.id}`} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Pagar ahora</Link>
            <CancelOrder orderId={order.id} />
          </div>
        )}
      </div>
    </div>
  );
}
