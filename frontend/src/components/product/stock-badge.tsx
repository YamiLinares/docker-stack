export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-danger">Agotado</span>;
  }
  if (stock <= 10) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-warning">Quedan {stock}</span>;
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-success">Disponible</span>;
}
