"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/actions/auth";
import { Field, SubmitButton } from "@/components/ui/form";
import { Notice } from "@/components/ui/states";
import { PASSWORD_RULES } from "@/lib/validation";
import { IDLE } from "@/types/action-state";

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(registerAction, IDLE);
  const [password, setPassword] = useState("");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const fields = state.status === "error" ? state.fields : undefined;

  return (
    <form action={action} className="space-y-4">
      {state.status === "error" && <Notice tone="error">{state.message}</Notice>}
      <input type="hidden" name="next" value={next} />
      <Field name="name" label="Nombre completo" autoComplete="name" required minLength={2} maxLength={120} defaultValue={fields?.name ?? ""} key={`n-${fields?.name ?? ""}`} errors={errors?.name} />
      <Field name="email" label="Correo electrónico" type="email" autoComplete="email" required maxLength={191} defaultValue={fields?.email ?? ""} key={`e-${fields?.email ?? ""}`} errors={errors?.email} />
      <Field name="phone" label="Teléfono (opcional)" type="tel" autoComplete="tel" maxLength={30} defaultValue={fields?.phone ?? ""} key={`p-${fields?.phone ?? ""}`} errors={errors?.phone} />
      <Field
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={72}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errors={errors?.password}
        hint={
          <ul className="grid grid-cols-2 gap-1" aria-label="Requisitos de la contraseña">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule.id} className={rule.test(password) ? "text-success" : ""}>
                {rule.test(password) ? "✓" : "•"} {rule.label}
              </li>
            ))}
          </ul>
        }
      />
      <Field name="password_confirmation" label="Repite la contraseña" type="password" autoComplete="new-password" required maxLength={72} errors={errors?.password_confirmation} />
      <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>
    </form>
  );
}
