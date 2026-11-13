import type { CartItem } from './types';
import type { Product } from '../Catalog/types';
import { getTotalStock } from './stock';
import type { BranchId } from '../auth/types';

export interface State {
    items: CartItem[];
}


export type Action =
 | { type: 'ADD_ITEM'; payload: { product: Product; branchId: BranchId | null } }
 | { type: 'SET_ITEM_BRANCH'; payload: { id: string; branchId: BranchId | null } }
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
            const itemExist = state.items.some((a) => a.id === product.objectID)

            if(itemExist) {
                return {
                    items: state.items.map((a) => {
                        if (a.id !== product.objectID) return a;
                        if (a.quantity >= a.stock) return a;
                        return withSubtotal({ ...a, quantity: a.quantity + 1 });
                    }),
                };
            }

            const newItem: CartItem = withSubtotal({
                id: product.objectID,
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

        case 'SET_ITEM_BRANCH':
            return {
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, branchId: action.payload.branchId }
                        : item
                ),
            };

        case 'INCREASE_ITEM':
            return {
                items: state.items.map((item) =>
                    item.id === action.payload && item.quantity < item.stock
                        ? withSubtotal({ ...item, quantity: item.quantity + 1 })
                        : item
                ),
            }

        case 'DECREASE_ITEM':
            return {
                items: state.items
                .map((item) => item.id === action.payload ? withSubtotal({...item, quantity: item.quantity - 1}) : item)
                .filter((item) => item.quantity > 0)
            }

        case 'REMOVE_ITEM':
            return { items: state.items.filter((item) => item.id !== action.payload) };

        case 'RESTORE_ITEM': {
            const { item, index } = action.payload;

            if (state.items.some((existing) => existing.id === item.id)) {
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
