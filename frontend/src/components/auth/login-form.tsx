"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Field, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/states";
import { IDLE } from "@/types/action-state";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, IDLE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const email = state.status === "error" ? (state.fields?.email ?? "") : "";

  return (
    <form action={action} className="space-y-4">
      {state.status === "error" && <Notice tone="error">{state.message}</Notice>}
      <input type="hidden" name="next" value={next} />
      <Field name="email" label="Correo electrónico" type="email" autoComplete="email" required maxLength={191} defaultValue={email} key={`e-${email}`} errors={errors?.email} />
      <Field name="password" label="Contraseña" type="password" autoComplete="current-password" required maxLength={72} errors={errors?.password} />
      <SubmitButton pendingLabel="Ingresando…">Ingresar</SubmitButton>
    </form>
  );
}
