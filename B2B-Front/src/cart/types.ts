import type { StockByHeadquarter } from '../Catalog/types';
import type { BranchId } from '../auth/types';

export interface CartItem {
  lineId?: string;
  id: string;
  title: string;
  price: number;
  prices?: {
    B2C: number;
    B2B: number;
  };
  quantity: number;
  img: string;
  stock: number;
  stockByBranch?: StockByHeadquarter;
  branchId?: BranchId | null;
  subtotal: number;
  category?: string;
  brand?: string;
}

export function createCartLineId(productId: string, branchId: BranchId | null): string {
  return JSON.stringify([productId, branchId]);
}

export function getCartLineId(item: CartItem): string {
  return item.lineId ?? createCartLineId(item.id, item.branchId ?? null);
}
