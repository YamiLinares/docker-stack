import { describe, expect, it } from "vitest";
import { ApiError, toApiError, userMessage } from "@/lib/api/errors";
import { catalogHref, parseCatalogQuery, parseProductId, productFamily } from "@/lib/catalog";
import { formatCents, formatMoney, toCents } from "@/lib/money";

describe("parseCatalogQuery", () => {
  it("lee búsqueda, orden, stock y página", () => {
    expect(parseCatalogQuery({ q: "  teclado ", sort: "-price", stock: "1", page: "2" })).toEqual({
      page: 2,
      perPage: 12,
      search: "teclado",
      sort: "-price",
      inStock: true,
    });
  });

  it("usa valores seguros ante datos inválidos (los mismos límites que el backend)", () => {
    const query = parseCatalogQuery({ q: "x".repeat(150), sort: "precio; DROP TABLE", page: "-4" });
    expect(query.search).toHaveLength(100);
    expect(query.sort).toBe("name");
    expect(query.page).toBe(1);
    expect(parseCatalogQuery({ page: "2.5" }).page).toBe(1);
  });

  it("genera URLs del catálogo omitiendo los valores por defecto", () => {
    expect(catalogHref({ page: 1, sort: "name" })).toBe("/productos");
    expect(catalogHref({ search: "libro", sort: "price", page: 3, inStock: true })).toBe("/productos?q=libro&sort=price&stock=1&page=3");
  });
});

describe("productos", () => {
  it("valida el id de la ruta", () => {
    expect(parseProductId("12")).toBe(12);
    for (const invalid of ["0", "-1", "abc", "1.5", "01", ""]) expect(parseProductId(invalid)).toBeNull();
  });

  it("deriva la familia del prefijo del SKU", () => {
    expect(productFamily("TEC-001").label).toBe("Tecnología");
    expect(productFamily("lib-002").label).toBe("Libros");
    expect(productFamily("XYZ-1").label).toBe("General");
  });
});

describe("dinero en céntimos", () => {
  it("convierte importes decimales sin errores de coma flotante", () => {
    expect(toCents("149.99")).toBe(14999);
    expect(toCents("0.1")).toBe(10);
    expect(toCents("899")).toBe(89900);
    expect(toCents("18.75") * 3).toBe(5625);
  });

  it("rechaza importes con formato inválido", () => {
    for (const invalid of ["-1", "1.999", "abc", "1,50", ""]) expect(() => toCents(invalid)).toThrow();
  });

  it("formatea en la moneda indicada", () => {
    expect(formatMoney("1234.5", "USD")).toMatch(/1.?234[.,]50/);
    expect(formatCents(5625, "usd")).toContain("56");
  });
});

describe("errores de la API", () => {
  it("separa errores de validación por campo y detalles de negocio", () => {
    const error = toApiError(422, { message: "Los datos enviados no son válidos.", code: "VALIDATION_ERROR", errors: { email: ["Ya está registrado."] } });
    expect(error.fieldErrors).toEqual({ email: ["Ya está registrado."] });

    const stock = toApiError(409, { message: "Stock insuficiente", code: "INSUFFICIENT_STOCK", errors: { product_id: 4, available: 1 } });
    expect(stock.details).toEqual({ product_id: 4, available: 1 });
  });

  it("muestra mensajes comprensibles sin detalles internos", () => {
    expect(userMessage(new ApiError(0, "NETWORK_ERROR", "fetch failed"))).toMatch(/No pudimos conectar/);
    expect(userMessage(new ApiError(500, "SERVER_ERROR", "SQLSTATE[42S02] tabla"))).not.toMatch(/SQLSTATE/);
    expect(userMessage(new ApiError(429, "TOO_MANY_REQUESTS", "Too Many Attempts."))).toMatch(/Demasiadas solicitudes/);
    expect(userMessage(new Error("x"))).toMatch(/error inesperado/);
  });
});
