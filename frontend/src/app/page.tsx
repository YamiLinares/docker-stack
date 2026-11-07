/**
 * Portada (Server Component renderizado en cada petición).
 * En Docker la imagen se compila sin acceso a la API, así que la portada no
 * se prerenderiza en el build: si lo hiciera, quedaría guardada con el aviso
 * de error. Los productos siguen saliendo de la caché de datos de Next.js
 * (5 minutos, etiqueta "products"), por lo que Laravel no recibe más tráfico.
 *
 * El encabezado y el texto principal (elemento LCP) se envían en el HTML
 * inicial; los productos destacados se transmiten dentro de <Suspense> con un
 * esqueleto del mismo tamaño, así una API lenta no retrasa el LCP ni mueve el diseño.
 */
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-card";
import { EmptyState, Notice } from "@/components/ui/states";
import { userMessage } from "@/lib/api/errors";
import { listProducts } from "@/lib/api/products";
import { getStoreCurrency } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Nueva temporada</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Equipa tu espacio de trabajo y tu día a día
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              Tecnología, hogar, deporte y libros seleccionados. Paga de forma segura con tarjeta y sigue el estado de tus
              compras en tiempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="rounded-xl bg-ink px-6 py-3 font-semibold text-white transition hover:bg-brand-900">
                Ver catálogo
              </Link>
              <Link href="/productos?sort=-created_at" className="rounded-xl border border-line px-6 py-3 font-semibold text-ink transition hover:bg-canvas">
                Novedades
              </Link>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 text-sm" aria-label="Ventajas de la tienda">
            {[
              ["Pago seguro", "Tarjetas procesadas por Stripe; nunca guardamos tus datos de pago."],
              ["Stock en tiempo real", "El inventario se reserva al confirmar la orden."],
              ["Seguimiento", "Consulta el estado de cada compra en «Mis compras»."],
              ["Precios claros", "El total final lo calcula el servidor, sin sorpresas."],
            ].map(([title, text]) => (
              <li key={title} className="rounded-2xl border border-line bg-canvas p-4">
                <p className="font-display font-bold text-ink">{title}</p>
                <p className="mt-1 text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="destacados" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="destacados" className="font-display text-2xl font-bold tracking-tight text-ink">
            Productos destacados
          </h2>
          <Link href="/productos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver todo →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProducts />
        </Suspense>
      </section>
    </>
  );
}

/** Carga los destacados sin romper la portada si la API no responde. */
async function loadFeatured() {
  try {
    const { data } = await listProducts({ page: 1, perPage: 8, search: "", sort: "-price", inStock: true });
    return { products: data, error: null };
  } catch (error) {
    return { products: [], error: userMessage(error) };
  }
}

async function FeaturedProducts() {
  const { products, error } = await loadFeatured();
  if (error) return <Notice tone="error">{error}</Notice>;
  if (products.length === 0) {
    return <EmptyState title="Aún no hay productos" message="Vuelve pronto: estamos preparando el catálogo." />;
  }
  return <ProductGrid products={products} currency={getStoreCurrency()} />;
}
