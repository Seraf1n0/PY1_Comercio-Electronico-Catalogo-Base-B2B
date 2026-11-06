export interface ProductView {
    action: "PRODUCT_VIEW";
    timestamp: string;
    productId: string;
    productTitle: string;
}

export interface ViewedProduct {
    productId: string;
    productTitle: string;
    lastViewed: string;
}