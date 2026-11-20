import { describe, expect, it } from "vitest";
import { applyB2BCondition } from "../cart/applyB2BCondition";
import { B2B_MINIMUM_VEHICLES, meetsB2BMinimum } from "../cart/b2bEligibility";
import type { CartItem } from "../cart/types";

function item(id: string, quantity: number): CartItem {
  return {
    id,
    title: id,
    price: 100,
    prices: { B2C: 100, B2B: 80 },
    quantity,
    img: "",
    stock: 10,
    subtotal: 100 * quantity,
  };
}

describe("Condición comercial B2B: mínimo de vehículos", () => {
  it(`el mínimo es ${B2B_MINIMUM_VEHICLES} vehículos sumando modelos distintos`, () => {
    expect(meetsB2BMinimum([item("a", 3)])).toBe(false);
    expect(meetsB2BMinimum([item("a", 2), item("b", 2)])).toBe(true);
  });

  it("B2B con menos del mínimo paga precio B2C", () => {
    const [line] = applyB2BCondition([item("a", 3)], "B2B");
    expect(line.price).toBe(100);
    expect(line.subtotal).toBe(300);
  });

  it("B2B que cumple el mínimo paga precio B2B en todas las líneas", () => {
    const lines = applyB2BCondition([item("a", 2), item("b", 2)], "B2B");
    expect(lines.map((line) => line.price)).toEqual([80, 80]);
    expect(lines.reduce((sum, line) => sum + line.subtotal, 0)).toBe(320);
  });

  it("B2C siempre paga precio B2C aunque compre muchos vehículos", () => {
    const [line] = applyB2BCondition([item("a", 10)], "B2C");
    expect(line.price).toBe(100);
  });
});
