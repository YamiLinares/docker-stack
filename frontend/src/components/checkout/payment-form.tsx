"use client";

/**
 * Formulario de tarjeta con Stripe Payment Element.
 * Los datos de la tarjeta se escriben en un iframe de Stripe: nunca pasan por
 * este frontend ni por Laravel (cumplimiento PCI). Al confirmar, Stripe
 * procesa el pago; la orden se marca como pagada solo cuando Laravel recibe el
 * webhook firmado. Por eso, tras confirmar, se va a una página que consulta el
 * estado REAL de la orden en el backend.
 */
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Notice } from "@/components/ui/states";

const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripe(publishableKey: string) {
  if (!stripeCache.has(publishableKey)) stripeCache.set(publishableKey, loadStripe(publishableKey));
  return stripeCache.get(publishableKey)!;
}

interface Props {
  orderId: number;
  clientSecret: string;
  publishableKey: string;
  amountLabel: string;
}

export default function PaymentForm({ orderId, clientSecret, publishableKey, amountLabel }: Props) {
  const stripePromise = useMemo(() => getStripe(publishableKey), [publishableKey]);
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: "es",
        appearance: { theme: "stripe", variables: { colorPrimary: "#2b50d6", borderRadius: "12px", fontFamily: "Inter, system-ui, sans-serif" } },
      }}
    >
      <CardForm orderId={orderId} amountLabel={amountLabel} />
    </Elements>
  );
}

function CardForm({ orderId, amountLabel }: { orderId: number; amountLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationPath = `/checkout/confirmacion?orden=${orderId}`;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      // La API crea el PaymentIntent sin métodos con redirección; si alguno la
      // necesitara, Stripe volvería a la página de confirmación.
      confirmParams: { return_url: `${window.location.origin}${confirmationPath}` },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "No se pudo procesar el pago. Revisa los datos de la tarjeta.");
      setSubmitting(false);
      return;
    }
    // Pago enviado a Stripe: el estado definitivo lo confirma el backend (webhook).
    router.replace(confirmationPath);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <Notice tone="error">{error}</Notice>}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
      >
        {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" aria-hidden="true" />}
        {submitting ? "Procesando pago…" : `Pagar ${amountLabel}`}
      </button>
      <p className="text-xs text-ink-muted">Modo de prueba de Stripe: usa la tarjeta 4242 4242 4242 4242, una fecha futura y cualquier CVC.</p>
    </form>
  );
}
