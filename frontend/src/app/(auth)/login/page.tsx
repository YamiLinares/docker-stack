import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Notice } from "@/components/ui/states";
import { safeNextPath } from "@/lib/security/redirect";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined, "/productos");

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="font-display text-2xl font-bold text-ink">Ingresa a tu cuenta</h1>
      <p className="mt-1 text-sm text-ink-muted">Necesitas una cuenta para comprar y ver tu historial.</p>
      <div className="mt-6 space-y-4">
        {params.sesion === "expirada" && <Notice tone="warning">Tu sesión expiró. Vuelve a ingresar para continuar.</Notice>}
        {params.next !== undefined && params.sesion !== "expirada" && <Notice tone="info">Ingresa para continuar con tu compra.</Notice>}
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿No tienes cuenta?{" "}
        <Link href={`/registro?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600 hover:text-brand-700">Regístrate</Link>
      </p>
    </div>
  );
}
