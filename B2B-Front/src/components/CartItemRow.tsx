import { useState } from "react";
import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { CartItem } from "../cart/types";
import { useCart } from "../cart/useCart";
import { errorMessages } from "../lib/errorMessages";

interface CartItemRowProps {
  item: CartItem;
  onNavigate?: () => void;
}

export default function CartItemRow({ item, onNavigate }: CartItemRowProps) {
    const { dispatch } = useCart();
    const [confirmingRemove, setConfirmingRemove] = useState(false);

    const handleDecrease = () => {
        if (item.quantity > 1) {
            dispatch({ type: 'DECREASE_ITEM', payload: item.id });
            return;
        }
        setConfirmingRemove(true);
    };

    const handleConfirmRemove = () => {
        dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    };

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

        {confirmingRemove ? (
          <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 p-2 animate-fade-in">
            <p role="alert" className="text-xs font-semibold text-amber-800">
              {errorMessages.cart.removeConfirm.question}
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              {errorMessages.cart.removeConfirm.hint}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                autoFocus
                onClick={handleConfirmRemove}
                className="cursor-pointer rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                {errorMessages.cart.removeConfirm.confirm}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                className="cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {errorMessages.cart.removeConfirm.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              aria-label={`Disminuir cantidad de ${item.title}`}
              onClick={handleDecrease}
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
        )}
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        aria-label={`Eliminar ${item.title} del carrito`}
        className="text-xs text-red-600 hover:underline cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>


    </li>
  );
}
