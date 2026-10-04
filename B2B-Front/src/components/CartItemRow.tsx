import { Link } from "react-router-dom";
import type { CartItem } from "../cart/types";
import { useCart } from "../cart/useCart";

interface CartItemRowProps {
  item: CartItem;
  onNavigate?: () => void;
}

export default function CartItemRow({ item, onNavigate }: CartItemRowProps) {
    const { dispatch } = useCart();

  return (
    <li className="flex items-center gap-3">
      <img
        src={item.img}
        alt={item.title}
        className="h-14 w-14 shrink-0 rounded object-cover"
      />

      <div className="min-w-0 flex-1">
        <Link
          to={`/producto/${item.id}`}
          onClick={onNavigate}
          className="block truncate text-sm font-semibold transition hover:text-indigo-600 hover:underline"
        >
          {item.title}
        </Link>
        <p className="text-xs text-slate-500">
          ₡{item.subtotal.toLocaleString("es-CR")}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            aria-label={`Disminuir cantidad de ${item.title}`}
            onClick={() => dispatch({ type: 'DECREASE_ITEM', payload: item.id })}
            className="h-6 w-6 rounded border border-slate-300 text-sm hover:bg-slate-100 cursor-pointer"
          >
            −
          </button>
          <span className="text-sm">{item.quantity}</span>
          <button
            type="button"
            aria-label={`Aumentar cantidad de ${item.title}`}
            onClick={() => dispatch({ type: 'INCREASE_ITEM', payload: item.id })}
            disabled={item.quantity >= item.stock}
            className="h-6 w-6 rounded border border-slate-300 text-sm hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        aria-label={`Eliminar ${item.title} del carrito`}
        className="text-xs text-red-600 hover:underline cursor-pointer"
      >
        Quitar
      </button>


    </li>
  );
}
