/**
 * Historial de compras (Server Component privado).
 * GET /orders devuelve SOLO las órdenes del usuario del token (filtro en
 * Laravel). La petición es no-store: nunca se comparte entre usuarios.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderStatusBadge, formatDate } from "@/components/orders/order-status";
import { EmptyState, PageHeading } from "@/components/ui/states";
import { ApiError } from "@/lib/api/errors";
import { listOrders } from "@/lib/api/orders";
import { redirectExpired, requireToken } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Mis compras", robots: { index: false } };

export default async function OrdersPage() {
  const token = await requireToken("/mis-compras");
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Tu cuenta" title="Mis compras" description="Consulta el estado de tus órdenes y pagos." />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList token={token} />
      </Suspense>
    </div>
  );
}

async function fetchOrders(token: string) {
  try {
    return await listOrders(token);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired("/mis-compras");
    throw error; // lo captura mis-compras/error.tsx
  }
}

async function OrdersList({ token }: { token: string }) {
  const { data: orders } = await fetchOrders(token);

  if (orders.length === 0) {
    return <EmptyState title="Todavía no tienes compras" message="Cuando realices tu primera compra aparecerá aquí con su estado." action={{ href: "/productos", label: "Explorar el catálogo" }} />;
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/mis-compras/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-brand-600/40">
            <div>
              <p className="font-display font-bold text-ink">Orden #{order.id}</p>
              <p className="text-sm text-ink-muted">
                {formatDate(order.created_at)} · {order.items_count ?? 0} {order.items_count === 1 ? "producto" : "productos"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <p className="font-display text-lg font-bold text-ink">{formatMoney(order.total, order.currency)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OrdersSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Cargando tus compras…</span>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-surface shadow-card" aria-hidden="true" />
      ))}
    </div>
  );
}
