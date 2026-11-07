import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-ink-muted sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-base font-bold text-ink">NovaShop</p>
          <p className="mt-2">Frontend académico de e-commerce con Next.js que consume una API REST en Laravel 12.</p>
        </div>
        <nav aria-label="Pie de página">
          <p className="font-semibold text-ink">Tienda</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link href="/productos" className="hover:text-ink">Catálogo</Link></li>
            <li><Link href="/productos?sort=-created_at" className="hover:text-ink">Novedades</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-semibold text-ink">Pagos</p>
          <p className="mt-2">Pagos con tarjeta procesados por Stripe (modo de prueba). Los datos de tarjeta nunca pasan por esta tienda.</p>
        </div>
      </div>
    </footer>
  );
}
