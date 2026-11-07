"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/states";
import { IDLE, type ActionState } from "@/types/action-state";
import type { Product } from "@/types/api";

type ProductAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

interface ProductFormProps {
  action: ProductAction;
  product?: Product;
  submitLabel: string;
  pendingLabel: string;
}

/** Formulario de producto para crear y editar. Tras un error conserva lo escrito. */
export function ProductForm({ action, product, submitLabel, pendingLabel }: ProductFormProps) {
  const [state, formAction] = useActionState(action, IDLE);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const sent = state.status === "error" ? state.fields : undefined;

  // Tras un intento fallido se muestran los valores enviados; si no, los del producto.
  const value = (key: keyof Product & string, fallback = "") => sent?.[key] ?? (product ? String(product[key] ?? "") : fallback);
  const active = sent ? sent.is_active === "on" : (product?.is_active ?? true);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.status === "error" && <Notice tone="error">{state.message}</Notice>}

      <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
        <Field name="sku" label="SKU" defaultValue={value("sku")} errors={errors.sku} required maxLength={64} autoComplete="off" hint="Mayúsculas, números y guiones." />
        <Field name="name" label="Nombre" defaultValue={value("name")} errors={errors.name} required maxLength={150} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="f-description" className="block text-sm font-semibold text-ink">
          Descripción <span className="font-normal text-ink-muted">(opcional)</span>
        </label>
        <textarea
          id="f-description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={value("description")}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "f-description-error" : undefined}
          className={`block w-full rounded-xl border bg-surface px-3.5 py-2.5 text-ink transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 ${errors.description ? "border-red-400" : "border-line"}`}
        />
        {errors.description && (
          <ul id="f-description-error" className="text-sm text-danger">
            {errors.description.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="price" label="Precio (USD)" inputMode="decimal" defaultValue={value("price")} errors={errors.price} required placeholder="49.90" />
        <Field name="stock" label="Stock" type="number" min={0} max={1000000} step={1} defaultValue={value("stock", "0")} errors={errors.stock} required />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
        <input type="checkbox" name="is_active" defaultChecked={active} className="mt-1 h-4 w-4 accent-brand-600" />
        <span className="text-sm">
          <span className="font-semibold text-ink">Visible en el catálogo</span>
          <span className="block text-ink-muted">Si lo desactivas, el producto solo aparece en este panel.</span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link href="/admin/productos" className="inline-flex h-12 items-center justify-center rounded-xl border border-line px-6 font-semibold text-ink hover:bg-canvas">
          Cancelar
        </Link>
        <SubmitButton pendingLabel={pendingLabel} className="sm:w-auto">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
