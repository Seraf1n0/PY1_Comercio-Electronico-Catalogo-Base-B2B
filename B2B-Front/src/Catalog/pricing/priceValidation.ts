import type { Role } from "../../auth/types";
import { isValidPrice, type Priceable } from "./priceView";
import { applyPriceOverride } from "./priceOverrides";

/**
 * Validacion de la informacion comercial de un producto.
 * Escenario del enunciado: "Precio o informacion comercial invalida ->
 * Manejar el error adecuadamente".
 */
export type PricingIssueCode = "MISSING_PRICE" | "MISSING_B2B_PRICE" | "B2B_ABOVE_B2C";

/** Mensaje para el panel administrativo (que hay que corregir). */
export const pricingIssueAdminText: Record<PricingIssueCode, string> = {
  MISSING_PRICE: "Sin precio B2C válido",
  MISSING_B2B_PRICE: "Sin precio B2B válido",
  B2B_ABOVE_B2C: "Precio B2B mayor que el B2C",
};

/** Mensaje para el cliente */
export const pricingIssueCustomerText =
  "Este producto no tiene un precio válido en este momento, por lo que no se puede comprar. Consulta con un asesor.";

export function getPricingIssues(original: Priceable): PricingIssueCode[] {
  const item = applyPriceOverride(original);
  const b2cRaw = item.prices?.B2C ?? item.price;
  const b2bRaw = item.prices?.B2B;
  const issues: PricingIssueCode[] = [];

  if (!isValidPrice(b2cRaw)) issues.push("MISSING_PRICE");
  if (!isValidPrice(b2bRaw)) issues.push("MISSING_B2B_PRICE");
  else if (isValidPrice(b2cRaw) && b2bRaw > b2cRaw) issues.push("B2B_ABOVE_B2C");

  return issues;
}

/**
 * True si el rol puede comprar el producto con un precio valido.
 * El B2B se valida contra su tarifa final (B2B), porque su orden siempre
 * se genera con precio B2B (minimo de vehiculos obligatorio).
 */
export function canBePurchasedBy(item: Priceable, role: Role | null): boolean {
  if (role !== "B2C" && role !== "B2B") return false;
  const issues = getPricingIssues(item);
  if (issues.includes("MISSING_PRICE")) return false;
  if (role === "B2B") return !issues.includes("MISSING_B2B_PRICE") && !issues.includes("B2B_ABOVE_B2C");
  return true;
}

/** Cedula juridica costarricense: 3-101-123456. */
export const LEGAL_ID_PATTERN = /^\d-\d{3}-\d{6}$/;

export function isValidLegalId(value: string | undefined | null): boolean {
  return typeof value === "string" && LEGAL_ID_PATTERN.test(value.trim());
}