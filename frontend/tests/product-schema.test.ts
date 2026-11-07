import { describe, expect, it } from "vitest";
import { productSchema } from "@/lib/validation";

const valid = { sku: " tec-010 ", name: "Teclado de prueba", description: "", price: "49.90", stock: "12", is_active: true };

describe("productSchema (panel de administración)", () => {
  it("normaliza el SKU, convierte el stock y deja la descripción vacía en null", () => {
    const result = productSchema.parse(valid);
    expect(result).toEqual({ sku: "TEC-010", name: "Teclado de prueba", description: null, price: "49.90", stock: 12, is_active: true });
  });

  it.each([
    ["sku", { sku: "tec 010" }],
    ["name", { name: "A" }],
    ["price", { price: "0.10" }],
    ["price", { price: "12,50" }],
    ["price", { price: "1.999" }],
    ["stock", { stock: "-1" }],
    ["stock", { stock: "2.5" }],
  ])("rechaza %s no válido: %j", (field, override) => {
    const result = productSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === field)).toBe(true);
  });
});
