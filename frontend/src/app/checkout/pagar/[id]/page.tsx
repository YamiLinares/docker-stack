/**
 * Paso 2: pago de una orden pendiente (Server Component privado).
 * Los importes vienen de Laravel; si la orden ya no está pendiente (pagada o
 * cancelada) se redirige a la confirmación, así recargar o volver atrás nunca
 * intenta cobrar dos veces.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PaymentPanel } from "@/components/checkout/payment-panel";
import { OrderItems } from "@/components/orders/order-items";
import { PageHeading } from "@/components/ui/states";
import { formatMoney } from "@/lib/money";
import { loadOwnOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Pago", robots: { index: false } };

export default async function PayPage({ params, searchParams }: PageProps<"/checkout/pagar/[id]">) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  const { order } = await loadOwnOrder(id, `/checkout/pagar/${id}`);

  if (order.status !== "pending") redirect(`/checkout/confirmacion?orden=${order.id}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Paso 2 de 2" title={`Pago de la orden #${order.id}`} description="Introduce los datos de tu tarjeta. El pago lo procesa Stripe de forma segura." />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="pago" className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 id="pago" className="mb-5 font-display text-lg font-bold text-ink">Tarjeta</h2>
          <PaymentPanel orderId={order.id} amountLabel={formatMoney(order.total, order.currency)} isNewOrder={nuevo === "1"} />
        </section>
        <aside aria-labelledby="detalle" className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h2 id="detalle" className="mb-2 font-display text-lg font-bold text-ink">Tu orden</h2>
          <OrderItems order={order} />
          <p className="mt-3 text-xs text-ink-muted">Importes calculados por el servidor. El stock queda reservado mientras la orden esté pendiente.</p>
        </aside>
      </div>
    </div>
  );
}
