"use client";

// Client Component: los límites de error necesitan el botón de reintento en el navegador.
import Link from "next/link";

export function ErrorView({ title, retry }: { title: string; retry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-danger">Algo salió mal</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-sm text-ink-muted">
        No pudimos comunicarnos con la tienda. Puede ser un problema temporal; inténtalo de nuevo en unos segundos.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Reintentar
        </button>
        <Link href="/" className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
