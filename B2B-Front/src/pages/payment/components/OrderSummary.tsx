import { formatColones } from "../../../cart/cartTotals";
import type { Order } from "../../../orders/types";

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-slate-900" : "text-slate-600"}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// Resumen de una orden
export default function OrderSummary({ order }: { order: Order }) {
  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium text-slate-800">{item.name}</p>
              <p className="text-slate-500">
                {item.quantity} × {formatColones(item.unitPrice)}
              </p>
            </div>
            <p className="shrink-0 font-semibold text-slate-900">
              {formatColones(item.subtotal)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
        <Row label="Subtotal" value={formatColones(order.subtotal)} />
        <Row label="IVA (13%)" value={formatColones(order.iva)} />
        <Row label="Envío" value={formatColones(order.shippingCost)} />
        <Row label="Total" value={formatColones(order.total)} bold />
      </dl>
    </div>
  );
}