import type { CartItem } from './types';
import type { Product } from '../Catalog/types';

export interface State {
    items: CartItem[];
}


export type Action =
 | { type: 'ADD_ITEM'; payload: Product }
 | { type: 'INCREASE_ITEM'; payload: string }
 | { type: 'DECREASE_ITEM'; payload: string}
 | { type: 'REMOVE_ITEM'; payload: string }
 | { type: 'CLEAR_CART' }


const withSubtotal = (item: CartItem): CartItem => ({
    ...item,
    subtotal: item.price * item.quantity,
});

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const itemExist = state.items.some((a) => a.id === action.payload.objectID)

            if(itemExist) {
                return {
                    items: state.items.map((a) =>
                        a.id === action.payload.objectID
                            ? withSubtotal({ ...a, quantity: a.quantity + 1 })
                            : a
                    ),
                };
            }

            const newItem: CartItem = withSubtotal({
                id: action.payload.objectID,
                title: action.payload.title ?? 'Falta titulo',
                price: action.payload.price,
                quantity: 1,
                img: action.payload.images_urls?.[0] ?? "/placeholder.png",
                subtotal: 0,
            });

            return { items: [...state.items, newItem] };
        }

        case 'INCREASE_ITEM':
            return {
                items: state.items
                .map((item) => item.id === action.payload ? withSubtotal({...item, quantity: item.quantity + 1}) : item)
                .filter((item) => item.quantity > 0)
            }

        case 'DECREASE_ITEM':
            return {
                items: state.items
                .map((item) => item.id === action.payload ? withSubtotal({...item, quantity: item.quantity - 1}) : item)
                .filter((item) => item.quantity > 0)
            }

        case 'REMOVE_ITEM':
            return { items: state.items.filter((item) => item.id !== action.payload) };

        case 'CLEAR_CART':
            return { items: [] };

        default:
            return state;
    }
 }
