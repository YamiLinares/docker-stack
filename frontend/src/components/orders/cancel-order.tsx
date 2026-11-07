"use client";

import { useActionState } from "react";
import { cancelOrderAction } from "@/actions/orders";
import { Notice } from "@/components/ui/states";
import { IDLE } from "@/types/action-state";

export function CancelOrder({ orderId }: { orderId: number }) {
  const [state, action, pending] = useActionState(cancelOrderAction, IDLE);
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("¿Cancelar esta orden? Se liberará el stock reservado.")) event.preventDefault();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="orderId" value={orderId} />
      {state.status !== "idle" && <Notice tone={state.status === "error" ? "error" : "success"}>{state.message}</Notice>}
      <button type="submit" disabled={pending} className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60">
        {pending ? "Cancelando…" : "Cancelar orden"}
      </button>
    </form>
  );
}
