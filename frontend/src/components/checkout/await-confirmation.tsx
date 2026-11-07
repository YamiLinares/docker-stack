"use client";

/**
 * Mientras Laravel no recibe el webhook de Stripe, la orden sigue «pendiente».
 * Este componente vuelve a pedir la página (router.refresh: el servidor
 * consulta de nuevo la API) cada 2 s, como máximo 30 veces.
 */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 30;

export function AwaitConfirmation() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) return;
    const timer = window.setTimeout(() => {
      router.refresh();
      setAttempts((value) => value + 1);
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [attempts, router]);

  return (
    <p role="status" aria-live="polite" className="text-sm text-ink-muted">
      {attempts < MAX_ATTEMPTS
        ? "Esperando la confirmación de Stripe… esta página se actualiza sola."
        : "La confirmación está tardando más de lo normal. Puedes revisar el estado más tarde en «Mis compras»."}
    </p>
  );
}
