import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import type { Product } from "../Catalog/types";
import { useCart } from "../cart/useCart";
import { useAnalytics } from "../analytics/useAnalytics";
import { useCartFeedback } from "./cartFeedbackContext";
import { useAuth } from "../auth/useAuth";
import { selectPrice } from "../Catalog/pricing/selectPrice";
import { B2B_MINIMUM_VEHICLES } from "../cart/b2bEligibility";
import { useBranch } from "../branch/useBranch";
import { getBranchInfo } from "../branch/branches";
import { getBranchStock } from "../inventory/inventoryOverrides";


type AddToCartSource = "catalog" | "detail";

export default function AddToCartButton({
    product,
    source = "catalog",
}: {
    product: Product;
    source?: AddToCartSource;
}) {
    const { state, dispatch } = useCart();
    const { notify } = useCartFeedback();
    const { track } = useAnalytics();
    const { role } = useAuth();
    const { selectedBranch } = useBranch();
    const branchId = selectedBranch;
    const existingItem = state.items.find(
        (item) => item.id === product.objectID && item.branchId === branchId,
    );
    const branchInfo = branchId ? getBranchInfo(branchId) : null;
    const availableStock = branchId ? getBranchStock(product, branchId) : 0;
    const currentQuantity = existingItem?.quantity ?? 0;
    const reachedLimit = currentQuantity >= availableStock;
    const totalVehiclesAfterAdd =
        state.items.reduce((total, item) => total + item.quantity, 0) + 1;
    const useB2BPrice = role === "B2B" && totalVehiclesAfterAdd >= B2B_MINIMUM_VEHICLES;
    const price = selectPrice(product, useB2BPrice ? "B2B" : "B2C");
    const hasPrice = typeof price === "number" && Number.isFinite(price);

    const canAdd =
        product.in_stock !== false && availableStock > 0 && hasPrice && !reachedLimit;

    const handleAdd = () => {
        if (!canAdd) return;

        dispatch({ type: 'ADD_ITEM', payload: { product, branchId } });

        track("ADD_TO_CART", {
            productId: product.objectID,
            title: product.title,
            category: product.categories?.[0] ?? "",
            brand: product.brand ?? "",
            quantity: 1,
            unitPrice: price,
            source,
        });

        const newQuantity = currentQuantity + 1;
        const label = product.title ?? "Producto";
        notify(`${label} · ${newQuantity} en el carrito`);
    };

    let buttonLabel = "Agregar al carrito";
    if (!branchId) {
        buttonLabel = "Selecciona una sucursal";
    } else if (!hasPrice) {
        buttonLabel = "Precio no disponible";
    } else if (availableStock === 0 || product.in_stock === false) {
        buttonLabel = `Sin stock en ${branchInfo?.label ?? "la sucursal"}`;
    } else if (reachedLimit) {
        buttonLabel = `Límite: ${availableStock} en ${branchInfo?.label ?? "la sucursal"}`;
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
