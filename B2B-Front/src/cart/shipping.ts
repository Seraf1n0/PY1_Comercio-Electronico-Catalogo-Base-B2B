import type { CartItem } from './types';

export const FLETE_PROMEDIO_SEDE_SAN_JOSE = 80833;
export const FACTOR_TRASLADO_INTERNO_Y_PROVINCIA = 2;

export function getTotalUnits(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getShippingCost(items: CartItem[]): number {
  return (
    FLETE_PROMEDIO_SEDE_SAN_JOSE *
    getTotalUnits(items) *
    FACTOR_TRASLADO_INTERNO_Y_PROVINCIA
  );
}
