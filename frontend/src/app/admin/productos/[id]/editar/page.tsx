import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateProductAction } from "@/actions/admin-products";
import { AdminForbidden } from "@/components/admin/forbidden";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeading } from "@/components/ui/states";
import { getAdminProduct } from "@/lib/api/admin-products";
import { ApiError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin";
import { redirectExpired } from "@/lib/auth/session";
import type { Product } from "@/types/api";

export const metadata: Metadata = { title: "Editar producto", robots: { index: false } };

export default async function EditProductPage({ params }: PageProps<"/admin/productos/[id]/editar">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const path = `/admin/productos/${id}/editar`;
  const access = await requireAdmin(path);
  if (!access.ok) return <AdminForbidden />;

  let product: Product;
  try {
    product = await getAdminProduct(access.token, id);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectExpired(path);
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow={`Administración · ${product.sku}`} title={`Editar ${product.name}`} />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <ProductForm action={updateProductAction} product={product} submitLabel="Guardar cambios" pendingLabel="Guardando…" />
      </div>
    </div>
  );
}
