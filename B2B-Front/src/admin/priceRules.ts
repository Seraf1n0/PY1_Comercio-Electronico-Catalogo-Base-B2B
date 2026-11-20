/** Reglas de la operacion simulada "Modificar precio". */
export const MAX_PRICE = 1_000_000_000; // ₡1.000 millones
export const HIGH_DISCOUNT_WARNING = 40; // % de descuento B2B que amerita advertencia

export type PriceFormErrors = { b2c?: string; b2b?: string };

function parsePrice(raw: string): { value: number | null; error?: string } {
  const clean = raw.trim();
  if (clean === "") return { value: null, error: "Ingresa un precio." };
  const value = Number(clean);
  if (!Number.isFinite(value)) return { value: null, error: "El precio debe ser un número." };
  if (!Number.isInteger(value)) return { value: null, error: "Usa colones enteros, sin decimales." };
  if (value <= 0) return { value: null, error: "El precio debe ser mayor que cero." };
  if (value > MAX_PRICE) return { value: null, error: "El precio supera el máximo permitido." };
  return { value };
}

/**
 * Valida los dos precios juntos. Ademas de que cada uno sea valido,
 * el precio B2B no puede superar al B2C.
 */
export function validatePriceForm(
  b2cRaw: string,
  b2bRaw: string,
): { errors: PriceFormErrors; b2c: number | null; b2b: number | null } {
  const b2c = parsePrice(b2cRaw);
  const b2b = parsePrice(b2bRaw);
  const errors: PriceFormErrors = {};

  if (b2c.error) errors.b2c = b2c.error;
  if (b2b.error) errors.b2b = b2b.error;
  if (!errors.b2c && !errors.b2b && b2b.value! > b2c.value!) {
    errors.b2b = "El precio B2B no puede ser mayor que el precio B2C.";
  }

  return { errors, b2c: b2c.value, b2b: b2b.value };
}

export function discountPercent(b2c: number, b2b: number): number {
  return Math.round(((b2c - b2b) / b2c) * 1000) / 10;
}