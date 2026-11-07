"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> {
  name: string;
  label: string;
  errors?: string[] | undefined;
  hint?: ReactNode;
}

/** Campo con etiqueta asociada y errores enlazados por aria-describedby. */
export function Field({ name, label, errors, hint, ...props }: FieldProps) {
  const id = `f-${name}`;
  const hasError = Boolean(errors?.length);
  const describedBy = [hint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">{label}</label>
      <input
        id={id}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={`block h-11 w-full rounded-xl border bg-surface px-3.5 text-ink transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 ${hasError ? "border-red-400" : "border-line"}`}
        {...props}
      />
      {hint && <div id={`${id}-hint`} className="text-xs text-ink-muted">{hint}</div>}
      {hasError && (
        <ul id={`${id}-error`} className="text-sm text-danger">
          {errors?.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}
    </div>
  );
}

/** Botón de envío: deshabilitado y con indicador mientras la acción está en curso (sin envíos duplicados). */
export function SubmitButton({ children, pendingLabel, className = "" }: { children: ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
