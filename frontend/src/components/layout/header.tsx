import Link from "next/link";
import { CartLink } from "@/components/cart/cart-link";
import { UserMenu } from "@/components/layout/user-menu";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="NovaShop, ir al inicio">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l-1 13H7z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      </span>
      <span className="hidden font-display text-lg font-bold tracking-tight text-ink min-[400px]:inline">NovaShop</span>
    </Link>
  );
}

/**
 * Encabezado: Server Component con dos "islas" de cliente pequeñas
 * (contador del carrito y menú de sesión). El resto no envía JavaScript.
 * Fondo sólido en lugar de backdrop-blur: el desenfoque obliga a repintar
 * al hacer scroll y aumentaba el trabajo del hilo principal en móviles.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="flex items-center gap-1">
          <Link href="/productos" className="hidden h-10 items-center rounded-lg px-3 text-sm font-semibold text-ink hover:bg-canvas sm:inline-flex">
            Catálogo
          </Link>
          <CartLink />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
