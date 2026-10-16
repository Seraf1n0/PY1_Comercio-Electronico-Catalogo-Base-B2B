export type PaymentStatus = "APPROVED" | "DECLINED" | "ERROR" | "PENDING";
export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";


export type OrderItem = {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export type Buyer = {
    name: string;
    lastName: string;
    email: string;
    phone: string;
}

export type Delivery = {
    address: string;
    province: string;
    canton: string;
    additionalAddress: string | null;
}

export type Order = {
    orderNumber: number;
    date: string;
    buyer: Buyer;
    delivery: Delivery;
    subtotal: number;
    iva: number;
    shippingCost: number;
    total: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    items: OrderItem[];

}