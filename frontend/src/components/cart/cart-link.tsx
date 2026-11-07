"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-store";

export function CartLink() {
  const { items } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink hover:bg-canvas"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" />
      </svg>
      {/* El nombre accesible coincide con el texto visible: «Carrito 2 artículos». */}
      <span className="sr-only sm:not-sr-only">Carrito</span>
      {/* Ancho mínimo reservado: el contador no desplaza el resto del encabezado (CLS). */}
      <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${items > 0 ? "bg-brand-600 text-white" : "bg-line text-ink-muted"}`}>
        {items}
      </span>
      <span className="sr-only">{items === 1 ? "artículo" : "artículos"}</span>
    </Link>
  );
}
