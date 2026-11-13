import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { CartItem } from "../../../cart/types";
import { useCart } from "../../../cart/useCart";
import { formatColones } from "../../../cart/cartTotals";
import { useAuth } from "../../../auth/useAuth";
import type { BranchId } from "../../../auth/types";
import { getBranchInfo, branches } from "../../../branch/branches";

interface CartLineItemProps {
  item: CartItem;
  onRemove: () => void;
}

export default function CartLineItem({ item, onRemove }: CartLineItemProps) {
  const { dispatch } = useCart();
  const { role } = useAuth();
  const branchId = item.branchId ?? null;
  const branchInfo = branchId ? getBranchInfo(branchId) : null;
  const branchStock = branchInfo && item.stockByBranch
    ? item.stockByBranch[branchInfo.stockKey]
    : null;
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

          {role === "B2B" && item.prices && (
            <>
              <p className="mt-1 text-sm font-semibold text-blue-800">
                Precio mayorista: {formatColones(item.prices.B2B)}
              </p>
              <p className="text-xs text-slate-400">
                Precio regular: {formatColones(item.prices.B2C)}
              </p>
            </>
          )}
          {(role !== "B2B" || !item.prices) && (
            <p className="mt-1 text-sm text-slate-500">
              Precio unitario: {formatColones(item.price)}
            </p>
          )}

          {branchInfo && (
            <p className={`mt-1 text-xs font-medium ${branchStock ? "text-green-700" : "text-amber-700"}`}>
              {branchStock === null
                ? `Inventario de ${branchInfo.label} no disponible en este artículo del carrito`
                : branchStock > 0
                  ? `Disponible en ${branchInfo.label}: ${branchStock}`
                  : `Sin stock en ${branchInfo.label}`}
            </p>
          )}
          <label className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            <span>Sucursal de origen:</span>
            <select
              value={item.branchId ?? ""}
              onChange={(event) => dispatch({
                type: "SET_ITEM_BRANCH",
                payload: { id: item.id, branchId: event.target.value ? event.target.value as BranchId : null },
              })}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
            >
              <option value="">Selecciona una sucursal</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.label}</option>
              ))}
            </select>
          </label>

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
