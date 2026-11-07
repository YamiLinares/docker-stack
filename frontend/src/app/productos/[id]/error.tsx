"use client";

import { ErrorView } from "@/components/ui/error-view";

export default function ProductError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="px-4 py-16">
      <ErrorView title="No pudimos cargar este producto" retry={retry} />
    </div>
  );
}
