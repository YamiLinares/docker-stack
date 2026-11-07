import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { PageHeading } from "@/components/ui/states";
import { requireToken } from "@/lib/auth/session";
import { getStoreCurrency } from "@/lib/config";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/** Página privada: requireToken verifica la sesión en el servidor (además del proxy). */
export default async function CheckoutPage() {
  await requireToken("/checkout");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Paso 1 de 2" title="Revisa tu orden" description="Confirma los productos. En el siguiente paso pagarás con tarjeta." />
      <CheckoutForm currency={getStoreCurrency()} />
    </div>
  );
}
