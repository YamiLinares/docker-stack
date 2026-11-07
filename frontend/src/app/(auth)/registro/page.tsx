import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNextPath } from "@/lib/security/redirect";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined, "/productos");

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h1 className="font-display text-2xl font-bold text-ink">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-ink-muted">Compra en minutos y sigue el estado de tus pedidos.</p>
      <div className="mt-6">
        <RegisterForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600 hover:text-brand-700">Ingresa</Link>
      </p>
    </div>
  );
}
