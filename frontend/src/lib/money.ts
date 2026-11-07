/**
 * Dinero en céntimos enteros (sin errores de coma flotante), igual que el
 * backend (App\Support\Money). Los totales que se muestran en el carrito son
 * estimaciones: el importe definitivo lo calcula Laravel al crear la orden.
 */

export function toCents(amount: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error(`Importe inválido: ${amount}`);
  const [units, decimals = ""] = amount.split(".");
  return Number(units) * 100 + Number(decimals.padEnd(2, "0"));
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export function formatMoney(amount: string, currency = "USD"): string {
  return formatCents(toCents(amount), currency);
}
