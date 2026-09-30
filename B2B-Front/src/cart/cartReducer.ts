import type { CartItem } from './types';
import type { Product } from '../Catalog/types';

export interface State {
    items: CartItem[];
}


export type Action =
 | { type: 'ADD_ITEM'; payload: Product }
 | { type: 'DECREASE_ITEM'; payload: string}
 | { type: 'REMOVE_ITEM'; payload: string }
 

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const itemExist = state.items.some((a) => a.id === action.payload.objectID)

            if(itemExist) {
                return { items: state.items.map((a) => a.id === action.payload.objectID ? { ...a, quantity: a.quantity + 1 } : a) };
            }

            const newItem: CartItem = {
                id: action.payload.objectID,
                title: action.payload.title ?? 'Falta titulo',
                price: action.payload.price,
                quantity: 1,
                img: action.payload.images_urls?.[0] ?? "/placeholder.png"
            };   

            return { items: [...state.items, newItem] };
        }

        case 'DECREASE_ITEM':
            return {
                items: state.items
                .map((item) => item.id === action.payload ? {...item, quantity: item.quantity - 1} : item)
                .filter((item) => item.quantity > 0)
            }            
            
        case 'REMOVE_ITEM':
            return { items: state.items.filter((item) => item.id !== action.payload) };
        default:
            return state;
    }
 }