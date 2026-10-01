import { useContext } from 'react';
import { CartContext } from './cartContext';


export const useCart = () => {
    const context = useContext(CartContext);
    if(!context) {
        throw new Error('useCart se debe utilizar dentro de un CartProvider');
    }
    return context;
}