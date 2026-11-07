import { ProductGridSkeleton } from "@/components/product/product-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2" aria-hidden="true">
        <div className="h-3 w-20 animate-pulse rounded bg-line" />
        <div className="h-9 w-72 animate-pulse rounded bg-line" />
      </div>
      <div className="mb-8 h-[76px] animate-pulse rounded-2xl bg-surface shadow-card" aria-hidden="true" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
