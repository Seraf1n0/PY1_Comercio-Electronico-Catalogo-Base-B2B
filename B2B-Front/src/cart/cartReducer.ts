import { createCartLineId, getCartLineId, type CartItem } from './types';
import type { Product } from '../Catalog/types';
import { getCartItemStock, getTotalStock } from './stock';
import type { BranchId } from '../auth/types';
import { getBranchStock } from '../inventory/inventoryOverrides';

export interface State {
    items: CartItem[];
}


export type Action =
 | { type: 'ADD_ITEM'; payload: { product: Product; branchId: BranchId | null } }
 | { type: 'SET_ITEM_BRANCH'; payload: { lineId: string; branchId: BranchId | null } }
 | { type: 'INCREASE_ITEM'; payload: string }
 | { type: 'DECREASE_ITEM'; payload: string}
 | { type: 'REMOVE_ITEM'; payload: string }
 | { type: 'RESTORE_ITEM'; payload: { item: CartItem; index: number } }
 | { type: 'CLEAR_CART' }
 | { type: 'SYNC_CART'; payload: CartItem[] };


const withSubtotal = (item: CartItem): CartItem => ({
    ...item,
    subtotal: item.price * item.quantity,
});

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { product, branchId } = action.payload;
            const existingItem = state.items.find(
                (item) => item.id === product.objectID && item.branchId === branchId,
            );

            if(existingItem) {
                return {
                    items: state.items.map((a) => {
                        if (getCartLineId(a) !== getCartLineId(existingItem)) return a;
                        if (!branchId) return a;
                        const available = getBranchStock(product, branchId);
                        if (a.quantity >= available) return a;
                        return withSubtotal({
                            ...a,
                            stock: getTotalStock(product),
                            stockByBranch: product.stock,
                            quantity: a.quantity + 1,
                        });
                    }),
                };
            }

            if (!branchId || getBranchStock(product, branchId) < 1) {
                return state;
            }

            const newItem: CartItem = withSubtotal({
                id: product.objectID,
                lineId: createCartLineId(product.objectID, branchId),
                title: product.title ?? 'Falta titulo',
                price: product.price,
                prices: product.prices,
                quantity: 1,
                img: product.images_urls?.[0] ?? "/placeholder.png",
                stock: getTotalStock(product),
                stockByBranch: product.stock,
                branchId,
                subtotal: 0,
                category: product.categories?.[0] ?? "",
                brand: product.brand ?? "",
            });

            return { items: [...state.items, newItem] };
        }

        case 'SET_ITEM_BRANCH': {
            const source = state.items.find(
                (item) => getCartLineId(item) === action.payload.lineId,
            );
            if (!source) return state;

            const nextLineId = createCartLineId(source.id, action.payload.branchId);
            const target = state.items.find(
                (item) => item.id === source.id && item.branchId === action.payload.branchId
                    && getCartLineId(item) !== action.payload.lineId,
            );

            if (target) {
                const items = state.items
                    .filter((item) => getCartLineId(item) !== action.payload.lineId)
                    .map((item) => getCartLineId(item) === getCartLineId(target)
                        ? withSubtotal({ ...item, quantity: item.quantity + source.quantity })
                        : item);
                return { items };
            }

            return {
                items: state.items.map((item) =>
                    getCartLineId(item) === action.payload.lineId
                        ? { ...item, lineId: nextLineId, branchId: action.payload.branchId }
                        : item
                ),
            };
        }

        case 'INCREASE_ITEM':
            return {
                items: state.items.map((item) =>
                    getCartLineId(item) === action.payload && item.quantity < getCartItemStock(item)
                        ? withSubtotal({ ...item, quantity: item.quantity + 1 })
                        : item
                ),
            }

        case 'DECREASE_ITEM':
            return {
                items: state.items
                .map((item) => getCartLineId(item) === action.payload ? withSubtotal({...item, quantity: item.quantity - 1}) : item)
                .filter((item) => item.quantity > 0)
            }

        case 'REMOVE_ITEM':
            return { items: state.items.filter((item) => getCartLineId(item) !== action.payload) };

        case 'RESTORE_ITEM': {
            const { item, index } = action.payload;

            if (state.items.some((existing) => getCartLineId(existing) === getCartLineId(item))) {
                return state;
            }

            const items = [...state.items];
            const safeIndex = Math.min(Math.max(index, 0), items.length);
            items.splice(safeIndex, 0, item);
            return { items };
        }

        case 'SYNC_CART':
            return { items: action.payload };

        case 'CLEAR_CART':
            return { items: [] };

        default:
            return state;
    }
 }
