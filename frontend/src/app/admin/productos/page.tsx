/**
 * Panel de productos (solo administradores). Lista también los productos
 * inactivos (include_inactive=1, que Laravel solo respeta para administradores).
 * Los datos se piden en cada carga con el JWT: nunca se cachean.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product";
import { AdminForbidden } from "@/components/admin/forbidden";
import { EmptyState, Notice, PageHeading } from "@/components/ui/states";
import { listAdminProducts } from "@/lib/api/admin-products";
import { ApiError, userMessage } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin";
import { redirectExpired } from "@/lib/auth/session";
import { formatMoney } from "@/lib/money";
import type { Paginated, Product } from "@/types/api";

export const metadata: Metadata = { title: "Administrar productos", robots: { index: false } };

const NOTICES: Record<string, string> = {
  creado: "Producto creado y guardado en MySQL.",
  actualizado: "Cambios guardados.",
};

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/productos">) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1);
  const notice = typeof params.aviso === "string" ? NOTICES[params.aviso] : undefined;

  const access = await requireAdmin("/admin/productos");
  if (!access.ok) return <AdminForbidden />;

  let result: Paginated<Product> | null = null;
  let error: string | null = null;
  try {
    result = await listAdminProducts(access.token, page, search);
  } catch (e) {
    if (e instanceof ApiError && e.isUnauthorized) redirectExpired("/admin/productos");
    error = userMessage(e);
  }

  const href = (p: number) => `/admin/productos?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(p) })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading eyebrow="Administración" title="Productos" description="Alta, edición y baja de productos. Los cambios se guardan en MySQL a través de la API de Laravel." />
        <Link href="/admin/productos/nuevo" className="mb-8 inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
          Nuevo producto
        </Link>
      </div>

      {notice && <div className="mb-6"><Notice tone="success">{notice}</Notice></div>}

      <form action="/admin/productos" method="get" role="search" className="mb-6 flex gap-2">
        <label className="sr-only" htmlFor="q">Buscar por nombre o SKU</label>
        <input id="q" name="q" defaultValue={search} placeholder="Buscar por nombre o SKU" className="h-11 w-full max-w-sm rounded-xl border border-line bg-surface px-3.5 text-ink focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        <button type="submit" className="h-11 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-canvas">Buscar</button>
      </form>

      {error && <Notice tone="error">{error}</Notice>}

      {result && result.data.length === 0 && (
        <EmptyState
          title={search ? "Sin resultados" : "No hay productos"}
          message={search ? `Ningún producto coincide con «${search}».` : "Crea el primer producto para que aparezca en el catálogo."}
          action={{ href: "/admin/productos/nuevo", label: "Nuevo producto" }}
        />
      )}

      {result && result.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">SKU</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Precio</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.data.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{product.sku}</td>
                    <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(product.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.is_active ? "bg-emerald-50 text-success" : "bg-canvas text-ink-muted"}`}>
                        {product.is_active ? "Visible" : "Oculto"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link href={`/admin/productos/${product.id}/editar`} className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand-700 hover:bg-canvas">
                        Editar
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
            <p>
              {result.meta.total} {result.meta.total === 1 ? "producto" : "productos"} · página {result.meta.current_page} de {result.meta.last_page}
            </p>
            {result.meta.last_page > 1 && (
              <nav aria-label="Paginación" className="flex gap-2">
                {result.meta.current_page > 1 && <Link href={href(result.meta.current_page - 1)} className="rounded-xl border border-line bg-surface px-4 py-2 font-semibold text-ink hover:bg-canvas">← Anterior</Link>}
                {result.meta.current_page < result.meta.last_page && <Link href={href(result.meta.current_page + 1)} className="rounded-xl border border-line bg-surface px-4 py-2 font-semibold text-ink hover:bg-canvas">Siguiente →</Link>}
              </nav>
            )}
          </div>
        </>
      )}
    </div>
  );
}
