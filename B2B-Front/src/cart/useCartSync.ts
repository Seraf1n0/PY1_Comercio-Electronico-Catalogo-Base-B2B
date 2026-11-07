import { useEffect } from 'react';
import { storageKeys } from '../lib/storageKeys';


export function useCartSync(userId: string, onCartChange: () => void) {
    useEffect(() => {
        const cartKey = storageKeys.cart(userId);
    
        function handleStorage(event: StorageEvent) {
            if (event.key === cartKey) {
                onCartChange();
            }
        }

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [userId, onCartChange]);
}