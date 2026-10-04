import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import type { Product } from "../Catalog/types";
import { useCart } from "../cart/useCart";
import { getTotalStock } from "../cart/stock";
import { useCartFeedback } from "./cartFeedbackContext";


export default function AddToCartButton({ product }: { product: Product }) {
    const { state, dispatch } = useCart();
    const { notify } = useCartFeedback();

    const totalStock = getTotalStock(product);
    const hasPrice = typeof product.price === "number" && Number.isFinite(product.price);
    const currentQuantity = state.items.find((item) => item.id === product.objectID)?.quantity ?? 0;
    const reachedLimit = currentQuantity >= totalStock;

    const canAdd =
        product.in_stock !== false && totalStock > 0 && hasPrice && !reachedLimit;

    const handleAdd = () => {
        if (!canAdd) return;

        dispatch({ type: 'ADD_ITEM', payload: product });

        const newQuantity = currentQuantity + 1;
        const label = product.title ?? "Producto";
        notify(`${label} · ${newQuantity} en el carrito`);
    };

    let buttonLabel = "Agregar al carrito";
    if (!canAdd) {
        buttonLabel = totalStock > 0 && hasPrice && reachedLimit ? "Máximo en carrito" : "Sin stock";
    }

    return (
        <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        aria-label={
            canAdd
                ? `Agregar ${product.title ?? "producto"} al carrito`
                : `${product.title ?? "Producto"}: ${buttonLabel}`
        }
        className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded w-full cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">

            <ShoppingCartIcon className="h-5 w-5" />
            {buttonLabel}
        </button>
    )

}
