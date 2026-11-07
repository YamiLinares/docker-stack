import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { PageHeading } from "@/components/ui/states";
import { getStoreCurrency } from "@/lib/config";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeading eyebrow="Tu compra" title="Carrito" />
      <CartView currency={getStoreCurrency()} />
    </div>
  );
}
