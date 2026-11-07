"use client";

/**
 * Menú de sesión. Consulta /api/session (respuesta privada y pequeña) para
 * que el resto de la página pueda servirse estática desde caché. Se vuelve
 * a consultar al cambiar de ruta (p. ej. tras iniciar o cerrar sesión).
 * Es solo interfaz: la protección real está en el servidor y en Laravel.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth";

type Session = { authenticated: false } | { authenticated: true; name: string; isAdmin?: boolean };

export function UserMenu() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/session", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<Session>) : { authenticated: false as const }))
      .then(setSession)
      .catch(() => undefined);
    return () => controller.abort();
  }, [pathname]);

  // Espacio reservado mientras se consulta la sesión (sin saltos de diseño).
  if (session === null) return <span className="inline-block h-10 w-28" aria-hidden="true" />;

  if (!session.authenticated) {
    return (
      <Link href="/login" className="inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-brand-900">
        Ingresar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {session.isAdmin && (
        <Link href="/admin/productos" className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-brand-700 hover:bg-canvas">
          Administrar
        </Link>
      )}
      <Link href="/mis-compras" className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-ink hover:bg-canvas">
        <span className="hidden max-w-32 truncate md:inline">Hola, {session.name.split(" ")[0]}</span>
        <span className="md:hidden">Mis compras</span>
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted hover:bg-canvas hover:text-ink">
          Salir
        </button>
      </form>
    </div>
  );
}
