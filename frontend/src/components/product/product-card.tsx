import Link from "next/link";
import { ProductPhoto } from "@/components/product/product-photo";
import { StockBadge } from "@/components/product/stock-badge";
import { productFamily } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/types/api";

/** Server Component: no envía JavaScript al navegador. */
// Ancho real de cada tarjeta: 2 columnas en móvil, 3 en tableta y 4 (máx. ~270 px) en escritorio.
const CARD_SIZES = "(min-width: 1024px) 270px, (min-width: 768px) 33vw, 50vw";

export function ProductCard({ product, currency, priority = false }: { product: Product; currency: string; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lg focus-within:shadow-lg">
      <ProductPhoto sku={product.sku} name={product.name} sizes={CARD_SIZES} priority={priority} className="transition duration-300 group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{productFamily(product.sku).label}</span>
          <StockBadge stock={product.stock} />
        </div>
        <h3 className="font-display text-base font-semibold leading-snug text-ink">
          <Link href={`/productos/${product.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.description && <p className="line-clamp-2 text-sm text-ink-muted">{product.description}</p>}
        <p className="mt-auto pt-2 font-display text-lg font-bold text-ink">{formatMoney(product.price, currency)}</p>
      </div>
    </article>
  );
}

/** priority: la primera fila visible se carga de inmediato (posible LCP); el resto, en diferido. */
export function ProductGrid({ products, currency, priority = false }: { products: Product[]; currency: string; priority?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} currency={currency} priority={priority && index < 2} />
        </li>
      ))}
    </ul>
  );
}

/** Esqueleto con las mismas proporciones que la tarjeta real: evita saltos de diseño (CLS). */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Cargando productos…</span>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="aspect-square w-full animate-pulse bg-line/60" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-line" />
              <div className="h-3 w-full animate-pulse rounded bg-line/70" />
              <div className="h-5 w-1/4 animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
