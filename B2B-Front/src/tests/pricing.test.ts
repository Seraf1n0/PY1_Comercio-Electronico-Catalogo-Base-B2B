import { describe, expect, it } from "vitest";
import { getPriceView, isValidPrice } from "../Catalog/pricing/priceView";
import {
  canBePurchasedBy,
  getPricingIssues,
  isValidLegalId,
} from "../Catalog/pricing/priceValidation";

const product = { objectID: "p1", price: 100_000, prices: { B2C: 100_000, B2B: 90_000 } };

describe("Precios diferenciados por rol", () => {
  it("B2C ve el precio B2C", () => {
    expect(getPriceView(product, "B2C")).toEqual({ status: "ok", tier: "B2C", amount: 100_000 });
  });

  it("B2B ve el precio B2B con el B2C de referencia y el % de ahorro", () => {
    expect(getPriceView(product, "B2B")).toEqual({
      status: "ok",
      tier: "B2B",
      amount: 90_000,
      compareAt: 100_000,
      savingsPercent: 10,
    });
  });

  it("B2B en el carrito sin cumplir el mínimo paga B2C y ve el B2B pendiente", () => {
    expect(getPriceView(product, "B2B", "B2C")).toEqual({
      status: "ok",
      tier: "B2C",
      amount: 100_000,
      pendingB2B: 90_000,
    });
  });

  it("ADMIN ve ambos precios", () => {
    expect(getPriceView(product, "ADMIN")).toEqual({ status: "admin", b2c: 100_000, b2b: 90_000 });
  });
});

describe("Precio o información comercial inválida", () => {
  it("considera inválidos los precios vacíos, cero, negativos o no numéricos", () => {
    for (const value of [undefined, null, 0, -5, Number.NaN, Infinity, "100"]) {
      expect(isValidPrice(value)).toBe(false);
    }
    expect(isValidPrice(1)).toBe(true);
  });

  it("un producto sin precios no se muestra ni se puede comprar", () => {
    const sinPrecio = { objectID: "prod272" };
    expect(getPriceView(sinPrecio, "B2C").status).toBe("unavailable");
    expect(getPricingIssues(sinPrecio)).toEqual(["MISSING_PRICE", "MISSING_B2B_PRICE"]);
    expect(canBePurchasedBy(sinPrecio, "B2C")).toBe(false);
    expect(canBePurchasedBy(sinPrecio, "B2B")).toBe(false);
  });

  it("un precio B2B mayor que el B2C es información comercial incoherente", () => {
    const incoherente = { objectID: "p2", prices: { B2C: 100, B2B: 120 } };
    expect(getPricingIssues(incoherente)).toEqual(["B2B_ABOVE_B2C"]);
    expect(getPriceView(incoherente, "B2B").status).toBe("unavailable");
    expect(canBePurchasedBy(incoherente, "B2B")).toBe(false);
    expect(canBePurchasedBy(incoherente, "B2C")).toBe(true);
  });

  it("el administrador nunca compra", () => {
    expect(canBePurchasedBy(product, "ADMIN")).toBe(false);
  });

  it("valida el formato de la cédula jurídica", () => {
    expect(isValidLegalId("3-101-123456")).toBe(true);
    expect(isValidLegalId("3101123456")).toBe(false);
    expect(isValidLegalId("")).toBe(false);
    expect(isValidLegalId(undefined)).toBe(false);
  });
});
