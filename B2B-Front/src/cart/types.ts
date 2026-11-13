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
  subtotal: number;
  category?: string;
  brand?: string;
}
