import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { CartItem } from "../../../cart/types";
import { useCart } from "../../../cart/useCart";
import { formatColones } from "../../../cart/cartTotals";

interface CartLineItemProps {
  item: CartItem;
  onRemove: () => void;
}

export default function CartLineItem({ item, onRemove }: CartLineItemProps) {
  const { dispatch } = useCart();
  const reachedMax = item.quantity >= item.stock;

  return (
    <li className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <img
          src={item.img}
          alt={item.title}
          className="h-20 w-24 shrink-0 rounded-lg object-cover sm:h-24 sm:w-32"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/producto/${item.id}`}
              className="line-clamp-2 font-semibold text-slate-800 transition hover:text-indigo-600 hover:underline"
            >
              {item.title}
            </Link>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Eliminar ${item.title} del carrito`}
              className="shrink-0 cursor-pointer rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Precio unitario: {formatColones(item.price)}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Disminuir cantidad de ${item.title}`}
                onClick={() => dispatch({ type: "DECREASE_ITEM", payload: item.id })}
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-md border border-slate-300 text-base leading-none transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="w-8 text-center text-sm font-semibold"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Aumentar cantidad de ${item.title}`}
                onClick={() => dispatch({ type: "INCREASE_ITEM", payload: item.id })}
                disabled={reachedMax}
                className="h-8 w-8 rounded-md border border-slate-300 text-base leading-none transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>

            <p className="text-base font-bold text-slate-900">
              {formatColones(item.subtotal)}
            </p>
          </div>

          {reachedMax && (
            <p className="mt-1 text-xs text-amber-600">
              Máximo disponible: {item.stock}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
