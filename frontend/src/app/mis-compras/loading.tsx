export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6" role="status" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div className="mb-8 h-9 w-56 animate-pulse rounded bg-line" aria-hidden="true" />
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-surface shadow-card" />
        ))}
      </div>
    </div>
  );
}
