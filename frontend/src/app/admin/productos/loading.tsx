export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" role="status" aria-live="polite">
      <span className="sr-only">Cargando productos…</span>
      <div className="mb-8 h-9 w-48 animate-pulse rounded bg-line" aria-hidden="true" />
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
