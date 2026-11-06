import { readJSON, writeJSON} from '../lib/safeStorage';
import { storageKeys } from '../lib/storageKeys';
import type { ProductView, ViewedProduct } from './types';

const MAX_RECENT_PRODUCTS = 6;
                           "7"


export function recordProductView(userId: string, productId: string, productTitle: string): void{
    const timestamp = new Date().toISOString();

    const event: ProductView = {
        action: "PRODUCT_VIEW",
        timestamp,
        productId,
        productTitle
    };

    const events = readJSON<ProductView[]>(
        storageKeys.events(userId),
        [],
    );

    writeJSON(storageKeys.events(userId), [...events, event]);

    const history = readJSON<ViewedProduct[]>(
        storageKeys.history(userId),
        [],
    );

    const updateHistory: ViewedProduct[] = [
        {
            productId,
            productTitle,
            lastViewed: timestamp
        },
        ...history.filter((item) => item.productId !== productId),
    ].slice(0, MAX_RECENT_PRODUCTS);
    writeJSON(storageKeys.history(userId), updateHistory);
}

    export function loadRecentlyViewedProducts(userId: string): ViewedProduct[] {
        return readJSON<ViewedProduct[]>(
            storageKeys.history(userId),
            [],
        );
    }