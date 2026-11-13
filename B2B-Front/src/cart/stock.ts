import type { Product } from '../Catalog/types';
import type { CartItem } from './types';
import { branches } from '../branch/branches';
import { getBranchStock } from '../inventory/inventoryOverrides';

export function getTotalStock(product: Pick<Product, 'objectID' | 'stock'>): number {
  return branches.reduce(
    (sum, branch) => sum + getBranchStock(product, branch.id),
    0,
  );
}

export function getCartItemStock(item: Pick<CartItem, 'id' | 'stock' | 'stockByBranch'>): number {
  return item.stockByBranch
    ? getTotalStock({ objectID: item.id, stock: item.stockByBranch })
    : item.stock;
}
