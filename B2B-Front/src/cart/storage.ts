import type { CartItem } from './types';
import { readJSON, writeJSON } from '../lib/safeStorage';
import { storageKeys } from '../lib/storageKeys';

const STORAGE_VERSION = 2;

function isValidItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.img === 'string' &&
    typeof item.stock === 'number' &&
    item.stock >= 0
  );
}

export function loadCart(): CartItem[] {
  const items = readJSON<CartItem[]>(storageKeys.cart, [], STORAGE_VERSION);

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(isValidItem)
    .map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));
}

export function saveCart(items: CartItem[]): void {
  writeJSON(storageKeys.cart, items, STORAGE_VERSION);
}
