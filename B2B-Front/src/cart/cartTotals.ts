import type { CartItem } from './types';

export const IVA_RATE = 0.13;

export function getProductSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.subtotal, 0);
}

export function getIva(subtotal: number): number {
  return Math.round(subtotal * IVA_RATE);
}

export function getTotal(items: CartItem[]): number {
  const subtotal = getProductSubtotal(items);
  return subtotal + getIva(subtotal);
}

export function formatColones(value: number): string {
  return `₡${value.toLocaleString('es-CR')}`;
}
