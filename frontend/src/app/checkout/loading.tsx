export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" role="status" aria-live="polite">
      <span className="sr-only">Preparando el checkout…</span>
      <div className="mb-8 space-y-2" aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded bg-line" />
        <div className="h-9 w-64 animate-pulse rounded bg-line" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]" aria-hidden="true">
        <div className="h-72 animate-pulse rounded-2xl bg-surface shadow-card" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface shadow-card" />
      </div>
    </div>
  );
}
