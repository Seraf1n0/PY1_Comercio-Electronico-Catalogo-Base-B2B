import type { CartItem } from "../cart/types";
import { formatColones, getIva, getProductSubtotal, getOrderTotal } from "../cart/cartTotals";
import { getShippingCost } from "../cart/shipping";

interface CartSummaryProps {
  items: CartItem[];
  className?: string;
  includeShipping?: boolean;
}

export default function CartSummary({
  items,
  className = "",
  includeShipping = false,
}: CartSummaryProps) {
  const subtotal = getProductSubtotal(items);
  const iva = getIva(subtotal);
  const shipping = includeShipping ? getShippingCost(items) : 0;
  const total = includeShipping ? getOrderTotal(items) : subtotal + iva;

  return (
    <div className={`flex flex-col gap-1 text-sm ${className}`}>
      <div className="flex items-center justify-between text-slate-600">
        <span>Subtotal</span>
        <span>{formatColones(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-slate-600">
        <span>IVA (13%)</span>
        <span>{formatColones(iva)}</span>
      </div>
      {includeShipping && (
        <div className="flex items-center justify-between text-slate-600">
          <span>Envío</span>
          <span>{formatColones(shipping)}</span>
        </div>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
        <span>Total</span>
        <span>{formatColones(total)}</span>
      </div>
    </div>
  );
}
