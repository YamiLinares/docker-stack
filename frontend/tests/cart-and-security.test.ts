import { describe, expect, it } from "vitest";
import { MAX_LINES, addLine, cartTotals, clampQuantity, removeLine, sanitizeLines, setLineQuantity, toOrderItems, type CartLine } from "@/lib/cart";
import { safeNextPath } from "@/lib/security/redirect";
import { loginSchema, orderItemsSchema, registerSchema } from "@/lib/validation";

const teclado = { productId: 1, name: "Teclado", sku: "TEC-001", price: "79.90", stock: 40 };
const botella = { productId: 12, name: "Botella", sku: "HOG-004", price: "18.75", stock: 3 };

describe("carrito", () => {
  it("agrega, acumula cantidades y calcula totales en céntimos", () => {
    let lines = addLine([], teclado, 2);
    lines = addLine(lines, botella, 1);
    lines = addLine(lines, teclado, 1);
    expect(lines.map((l) => [l.productId, l.quantity])).toEqual([[1, 3], [12, 1]]);
    expect(cartTotals(lines)).toEqual({ items: 4, subtotalCents: 3 * 7990 + 1875 });
  });

  it("limita la cantidad al stock y a 100 unidades", () => {
    expect(addLine([], botella, 10)[0]?.quantity).toBe(3);
    expect(clampQuantity(500, 1000)).toBe(100);
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(Number.NaN, 5)).toBe(1);
  });

  it("no agrega productos agotados ni más de 50 líneas", () => {
    expect(addLine([], { ...teclado, stock: 0 }, 1)).toEqual([]);
    const full = Array.from({ length: MAX_LINES }, (_, i): CartLine => ({ ...teclado, productId: i + 100, quantity: 1 }));
    expect(addLine(full, teclado, 1)).toHaveLength(MAX_LINES);
  });

  it("modifica y elimina líneas", () => {
    const lines = addLine(addLine([], teclado, 1), botella, 1);
    expect(setLineQuantity(lines, 12, 99)[1]?.quantity).toBe(3);
    expect(removeLine(lines, 1).map((l) => l.productId)).toEqual([12]);
  });

  it("solo envía id y cantidad al backend (nunca precios)", () => {
    const items = toOrderItems(addLine([], teclado, 2));
    expect(items).toEqual([{ product_id: 1, quantity: 2 }]);
    expect(JSON.stringify(items)).not.toContain("79.90");
  });

  it("descarta datos manipulados o corruptos de localStorage", () => {
    const stored = [
      { ...teclado, quantity: 2 },
      { ...teclado, quantity: 5 },
      { productId: -1, name: "x", sku: "x", price: "1.00", stock: 1, quantity: 1 },
      { productId: 3, name: "<script>", sku: "X", price: "gratis", stock: 1, quantity: 1 },
      { ...botella, quantity: 999 },
      "basura",
      null,
    ];
    expect(sanitizeLines(stored).map((l) => [l.productId, l.quantity])).toEqual([[1, 2], [12, 3]]);
    expect(sanitizeLines({ no: "array" })).toEqual([]);
  });
});

describe("safeNextPath", () => {
  it("acepta rutas internas permitidas", () => {
    expect(safeNextPath("/checkout")).toBe("/checkout");
    expect(safeNextPath("/mis-compras/7")).toBe("/mis-compras/7");
    expect(safeNextPath("/productos?q=libro")).toBe("/productos?q=libro");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/admin", "/checkoutx", "", undefined])(
    "rechaza %j",
    (value) => expect(safeNextPath(value)).toBe("/mis-compras"),
  );
});

describe("validación en el servidor", () => {
  it("valida el login", () => {
    expect(loginSchema.safeParse({ email: "Ana@Example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "no-es-correo", password: "x" }).success).toBe(false);
  });

  it("aplica la política de contraseña de Laravel en el registro", () => {
    const base = { name: "Ana Pérez", email: "ana@example.com", phone: "", password: "Segura123", password_confirmation: "Segura123" };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, password: "debil", password_confirmation: "debil" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password_confirmation: "Otra1234" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, name: "<b>Ana</b>" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, phone: "abc" }).success).toBe(false);
  });

  it("valida los ítems de la orden como StoreOrderRequest", () => {
    expect(orderItemsSchema.safeParse([{ product_id: 1, quantity: 2 }]).success).toBe(true);
    expect(orderItemsSchema.safeParse([]).success).toBe(false);
    expect(orderItemsSchema.safeParse([{ product_id: 1, quantity: 101 }]).success).toBe(false);
    expect(orderItemsSchema.safeParse([{ product_id: 1, quantity: 1 }, { product_id: 1, quantity: 1 }]).success).toBe(false);
    expect(orderItemsSchema.safeParse([{ product_id: 1, quantity: 1, price: "0.01" }]).data).toEqual([{ product_id: 1, quantity: 1 }]);
  });
});
