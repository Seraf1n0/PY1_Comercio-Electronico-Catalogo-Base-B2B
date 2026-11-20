
export function getProductTitle(product: {
  title?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}): string {
  const title = typeof product.title === "string" ? product.title.trim() : "";
  if (title) return title;
  const fallback = [product.brand, product.model, product.year].filter(Boolean).join(" ");
  return fallback || "Producto sin nombre";
}