import { formatMoney } from "@/lib/money";
import type { Order } from "@/types/api";

/** Productos e importes tal como los guardó Laravel (precio congelado al crear la orden). */
export function OrderItems({ order }: { order: Order }) {
  return (
    <div>
      <ul className="divide-y divide-line">
        {(order.items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
            <span className="text-ink">
              {item.product_name} <span className="text-ink-muted">× {item.quantity} · {formatMoney(item.unit_price, order.currency)} c/u</span>
            </span>
            <span className="font-semibold text-ink">{formatMoney(item.subtotal, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-lg font-bold text-ink">
        <span>Total</span>
        <span>{formatMoney(order.total, order.currency)}</span>
      </div>
    </div>
  );
}
