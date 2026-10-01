import type { CartItem } from "../cart/types";
import { useCart } from "../cart/useCart";

export default function CartItemRow({ item }: { item: CartItem }) {
    const { dispatch } = useCart(); 

  return (
    <li className="flex items-center gap-3">
      <img
        src={item.img}
        alt={item.title}
        className="h-14 w-14 shrink-0 rounded object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.title}</p>
        <p className="text-xs text-slate-500">
          ₡{(item.price * item.quantity).toLocaleString("es-CR")}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={() => dispatch({ type: 'DECREASE_ITEM', payload: item.id })}
            className="h-6 w-6 rounded border border-slate-300 text-sm hover:bg-slate-100 cursor-pointer"
          >
            −
          </button>
          <span className="text-sm">{item.quantity}</span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => dispatch({ type: 'INCREASE_ITEM', payload: item.id })}

            className="h-6 w-6 rounded border border-slate-300 text-sm hover:bg-slate-100 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}

        className="text-xs text-red-600 hover:underline cursor-pointer"
      >
        Quitar
      </button>


    </li>
  );
}