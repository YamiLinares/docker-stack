import type { OrderStatus } from "@/types/api";

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "bg-amber-50 text-warning" },
  paid: { label: "Pagada", className: "bg-emerald-50 text-success" },
  shipped: { label: "Enviada", className: "bg-brand-50 text-brand-700" },
  delivered: { label: "Entregada", className: "bg-emerald-50 text-success" },
  cancelled: { label: "Cancelada", className: "bg-line text-ink-muted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS[status] ?? { label: status, className: "bg-line text-ink" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
}

export function formatDate(iso: string | null): string {
  return iso ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—";
}
