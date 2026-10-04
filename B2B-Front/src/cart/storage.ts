import type { CartItem } from './types';

const STORAGE_KEY = 'bombocars:cart:v2';
const STORAGE_VERSION = 2;

interface PersistedCart {
  version: number;
  items: CartItem[];
}

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
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as PersistedCart;
    if (
      !parsed ||
      parsed.version !== STORAGE_VERSION ||
      !Array.isArray(parsed.items)
    ) {
      return [];
    }

    return parsed.items
      .filter(isValidItem)
      .map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      }));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: PersistedCart = { version: STORAGE_VERSION, items };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage lleno o bloqueado: no debe romper la aplicación.
  }
}
