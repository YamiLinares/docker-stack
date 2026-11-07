"use client";

import { useActionState } from "react";
import { deleteProductAction } from "@/actions/admin-products";
import { IDLE } from "@/types/action-state";

/** Eliminar con confirmación. Laravel aplica borrado lógico (SoftDeletes): las órdenes antiguas conservan su referencia. */
export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [state, formAction, pending] = useActionState(deleteProductAction, IDLE);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar «${name}»? Dejará de aparecer en el catálogo.`)) event.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
        aria-label={`Eliminar ${name}`}
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {state.status === "error" && (
        <span role="alert" className="ml-2 text-xs text-danger">
          {state.message}
        </span>
      )}
    </form>
  );
}
