import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({ title, message, action }: { title: string; message: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{message}</p>
      {action && (
        <Link href={action.href} className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success" | "info" | "warning"; children: ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-danger",
    success: "border-emerald-200 bg-emerald-50 text-success",
    info: "border-brand-100 bg-brand-50 text-brand-900",
    warning: "border-amber-200 bg-amber-50 text-warning",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>}
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
    </div>
  );
}
