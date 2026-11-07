import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_IMAGES, productImage } from "@/lib/product-images";

describe("fotos de producto", () => {
  const entries = Object.entries(PRODUCT_IMAGES);

  it("cubre los 20 SKU del catálogo", () => {
    expect(entries).toHaveLength(20);
  });

  it.each(entries)("%s: el archivo existe y tiene créditos completos", (sku, image) => {
    expect(image.src).toBe(`/productos/${sku.toLowerCase()}.webp`);
    expect(existsSync(join(process.cwd(), "public", image.src))).toBe(true);
    expect(image.alt.length).toBeGreaterThan(5);
    expect(image.author.length).toBeGreaterThan(0);
    expect(image.license).toMatch(/^(CC0|CC BY(-SA)? \d\.\d|Public domain)$/);
    expect(image.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  });

  it("busca sin importar mayúsculas ni espacios y devuelve null si no hay foto", () => {
    expect(productImage(" tec-001 ")?.src).toBe("/productos/tec-001.webp");
    expect(productImage("XYZ-999")).toBeNull();
  });
});
