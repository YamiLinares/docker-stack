/**
 * Detalle de producto (Server Component con ISR bajo demanda).
 * - generateStaticParams vacío + revalidate: cada ficha se genera en su primera
 *   visita y se sirve desde caché 5 minutos (TTFB bajo).
 * - El producto se consulta ANTES de cualquier Suspense para que un id
 *   inexistente devuelva un 404 real.
 * - Los productos relacionados se transmiten aparte dentro de <Suspense>.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductPhoto } from "@/components/product/product-photo";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-card";
import { StockBadge } from "@/components/product/stock-badge";
import { getProduct, listProducts } from "@/lib/api/products";
import { parseProductId, productFamily } from "@/lib/catalog";
import { getStoreCurrency } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { productImage } from "@/lib/product-images";

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

async function loadProduct(rawId: string) {
  const id = parseProductId(rawId);
  return id === null ? null : getProduct(id);
}

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const product = await loadProduct((await params).id).catch(() => null);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description ?? `Compra ${product.name} en NovaShop.`,
    alternates: { canonical: `/productos/${product.id}` },
    openGraph: { title: product.name, description: product.description ?? undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/productos/[id]">) {
  const product = await loadProduct((await params).id);
  if (!product) notFound();

  const currency = getStoreCurrency();
  const family = productFamily(product.sku);
  const photo = productImage(product.sku);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-ink-muted">
        <Link href="/productos" className="font-semibold text-brand-600 hover:text-brand-700">Catálogo</Link>
        <span aria-hidden="true"> / </span>
        <span>{family.label}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <figure>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            {/* Imagen principal: es el LCP de la ficha, por eso se carga con prioridad. */}
            <ProductPhoto sku={product.sku} name={product.name} sizes="(min-width: 1152px) 552px, (min-width: 768px) 46vw, calc(100vw - 2rem)" priority />
          </div>
          {photo && (
            <figcaption className="mt-2 text-xs text-ink-muted">
              Foto ilustrativa: {photo.author} ·{" "}
              <a href={photo.source} className="underline hover:text-ink" target="_blank" rel="noopener noreferrer">
                {photo.license}, Wikimedia Commons
              </a>
            </figcaption>
          )}
        </figure>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {family.label} · SKU {product.sku}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <p className="font-display text-3xl font-bold text-ink">{formatMoney(product.price, currency)}</p>
            <StockBadge stock={product.stock} />
          </div>
          {product.description && <p className="mt-6 leading-relaxed text-ink-muted">{product.description}</p>}
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-surface p-3 ring-1 ring-line">
              <dt className="text-ink-muted">Unidades disponibles</dt>
              <dd className="mt-0.5 font-semibold text-ink">{product.stock}</dd>
            </div>
            <div className="rounded-xl bg-surface p-3 ring-1 ring-line">
              <dt className="text-ink-muted">Moneda</dt>
              <dd className="mt-0.5 font-semibold text-ink">{currency}</dd>
            </div>
          </dl>
          <div className="mt-8" id="compra">
            {/* Única parte interactiva de la ficha: el resto no envía JavaScript. */}
            <AddToCart product={{ productId: product.id, name: product.name, sku: product.sku, price: product.price, stock: product.stock }} />
          </div>
        </div>
      </div>

      <section aria-labelledby="relacionados" className="mt-16">
        <h2 id="relacionados" className="mb-6 font-display text-2xl font-bold tracking-tight text-ink">
          Más de {family.label.toLowerCase()}
        </h2>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <RelatedProducts sku={product.sku} excludeId={product.id} currency={currency} />
        </Suspense>
      </section>
    </div>
  );
}

async function RelatedProducts({ sku, excludeId, currency }: { sku: string; excludeId: number; currency: string }) {
  // El backend busca también por SKU: el prefijo de familia ("TEC-") devuelve productos similares.
  const related = await listProducts({ page: 1, perPage: 5, search: `${sku.slice(0, 3)}-`, sort: "name", inStock: false }).catch(() => null);
  const items = related?.data.filter((item) => item.id !== excludeId).slice(0, 4) ?? [];
  if (items.length === 0) return <p className="text-sm text-ink-muted">No hay otros productos de esta familia por ahora.</p>;
  return <ProductGrid products={items} currency={currency} />;
}
