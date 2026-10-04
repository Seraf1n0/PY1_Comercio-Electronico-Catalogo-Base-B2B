import type { Product } from '../Catalog/types';

export function getTotalStock(product: Pick<Product, 'stock'>): number {
  if (!product.stock) {
    return 0;
  }

  return Object.values(product.stock).reduce(
    (sum, cantidad) => sum + (cantidad ?? 0),
    0
  );
}
