/**
 * Catálogo con búsqueda, orden, filtro de stock y paginación (Server Component).
 * Los filtros viajan en la URL (formulario GET), así que funcionan sin
 * JavaScript y se pueden compartir. Los datos vienen de la caché de Next.js
 * (etiqueta "products"), por lo que cambiar de página casi nunca llama a Laravel.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-card";
import { EmptyState, PageHeading } from "@/components/ui/states";
import { listProducts } from "@/lib/api/products";
import { CATALOG_PAGE_SIZE, SORT_OPTIONS, catalogHref, parseCatalogQuery, type CatalogQuery } from "@/lib/catalog";
import { getStoreCurrency } from "@/lib/config";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora todos los productos de NovaShop: tecnología, hogar, deporte, libros y accesorios.",
  alternates: { canonical: "/productos" },
};

export default async function ProductsPage({ searchParams }: PageProps<"/productos">) {
  const query = parseCatalogQuery(await searchParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Catálogo" title="Todos los productos" description="Busca por nombre, SKU o descripción y ordena como prefieras." />

      <form action="/productos" method="get" role="search" className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="q">Buscar productos</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query.search}
          maxLength={100}
          placeholder="Buscar: teclado, libro, TEC-001…"
          className="h-11 rounded-xl border border-line bg-canvas px-4 text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:bg-surface focus:outline-none"
        />
        <label className="sr-only" htmlFor="sort">Ordenar por</label>
        <select id="sort" name="sort" defaultValue={query.sort} className="h-11 rounded-xl border border-line bg-canvas px-3 text-ink focus:border-brand-600 focus:outline-none">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-canvas px-3 text-sm text-ink">
          <input type="checkbox" name="stock" value="1" defaultChecked={query.inStock} className="h-4 w-4 accent-brand-600" />
          Solo disponibles
        </label>
        <button type="submit" className="h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-900">
          Aplicar
        </button>
      </form>

      {/* La key reinicia el esqueleto al cambiar de filtros o de página. */}
      <Suspense key={JSON.stringify(query)} fallback={<ProductGridSkeleton count={CATALOG_PAGE_SIZE} />}>
        <CatalogResults query={query} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({ query }: { query: CatalogQuery }) {
  // Los errores llegan a productos/error.tsx (límite de error con reintento).
  const { data, meta } = await listProducts(query);

  if (data.length === 0) {
    return query.search || query.inStock ? (
      <EmptyState title="Sin resultados" message="Ningún producto coincide con tu búsqueda. Prueba con otras palabras o quita los filtros." action={{ href: "/productos", label: "Ver todo el catálogo" }} />
    ) : (
      <EmptyState title="El catálogo está vacío" message="Todavía no hay productos publicados." />
    );
  }

  return (
    <>
      {/* Mantiene el orden de encabezados (h1 → h2 → h3 de cada tarjeta) para lectores de pantalla. */}
      <h2 className="sr-only">Resultados</h2>
      <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
        {meta.total} {meta.total === 1 ? "producto" : "productos"} · página {meta.current_page} de {meta.last_page}
      </p>
      <ProductGrid products={data} currency={getStoreCurrency()} priority />
      {meta.last_page > 1 && (
        <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
          <PageLink query={query} page={meta.current_page - 1} disabled={meta.current_page <= 1} label="← Anterior" />
          <span className="px-3 text-sm text-ink-muted">
            {meta.current_page} / {meta.last_page}
          </span>
          <PageLink query={query} page={meta.current_page + 1} disabled={meta.current_page >= meta.last_page} label="Siguiente →" />
        </nav>
      )}
    </>
  );
}

function PageLink({ query, page, disabled, label }: { query: CatalogQuery; page: number; disabled: boolean; label: string }) {
  if (disabled) {
    return <span className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-muted/50" aria-disabled="true">{label}</span>;
  }
  return (
    <Link href={catalogHref({ ...query, page })} className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas">
      {label}
    </Link>
  );
}
