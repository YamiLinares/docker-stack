import type { Metadata } from "next";
import { createProductAction } from "@/actions/admin-products";
import { AdminForbidden } from "@/components/admin/forbidden";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeading } from "@/components/ui/states";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Nuevo producto", robots: { index: false } };

export default async function NewProductPage() {
  const access = await requireAdmin("/admin/productos/nuevo");
  if (!access.ok) return <AdminForbidden />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Administración" title="Nuevo producto" />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <ProductForm action={createProductAction} submitLabel="Crear producto" pendingLabel="Guardando…" />
      </div>
    </div>
  );
}
