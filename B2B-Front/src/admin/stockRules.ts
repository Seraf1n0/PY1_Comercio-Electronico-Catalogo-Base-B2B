/** Reglas de la operacion simulada "Modificar inventario". */
export const MAX_STOCK = 999;

/** Valida el nuevo stock y devuelve un mensaje para el usuario, o null si es valido. */
export function validateStockInput(raw: string): string | null {
  if (raw.trim() === "") return "Ingresa la nueva cantidad.";
  const value = Number(raw);
  if (!Number.isFinite(value)) return "La cantidad debe ser un número.";
  if (!Number.isInteger(value)) return "La cantidad debe ser un número entero (sin decimales).";
  if (value < 0) return "El inventario no puede ser negativo.";
  if (value > MAX_STOCK) return `La cantidad máxima permitida es ${MAX_STOCK}.`;
  return null;
}