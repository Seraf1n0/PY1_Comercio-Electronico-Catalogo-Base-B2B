import type { StockByHeadquarter } from '../Catalog/types';
import type { BranchId } from '../auth/types';

export interface CartItem {
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
