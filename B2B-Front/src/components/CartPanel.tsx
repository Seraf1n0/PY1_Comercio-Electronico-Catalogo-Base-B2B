import { useNavigate } from "react-router-dom";
import { useCart } from "../cart/useCart";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

export default function CartPanel({ onClose }: { onClose?: () => void }) {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();

    const handleViewCart = () => {
        onClose?.();
        navigate("/carrito");
    };

  return (
    <div className="absolute right-0 top-10 z-40 w-80 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Tu carrito
        </h2>

        {state.items.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_CART' })}
            className="cursor-pointer text-xs font-semibold text-red-600 hover:underline"
          >
            Vaciar carrito
          </button>
        )}
      </div>

      {state.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          El carrito está vacío
        </p>
      ) : (
        <>
          <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {state.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
            ))}
          </ul>

          <CartSummary items={state.items} className="mt-4 border-t border-slate-200 pt-3" />

          {/* Usen estos botones para redirigir */}
            <div className="mt-3 flex flex-col gap-2">
            <button
                type="button"
                onClick={handleViewCart}
                className="w-full cursor-pointer rounded border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
            >
                Ver carrito
            </button>
            <button
                type="button"
                className="w-full cursor-pointer rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
                Finalizar compra
            </button>
            </div>
        </>
      )}
    </div>
  );
}
