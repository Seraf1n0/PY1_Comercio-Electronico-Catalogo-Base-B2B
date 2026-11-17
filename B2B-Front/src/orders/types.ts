import type { BranchId, Role } from "../auth/types";

export type PaymentStatus = "APPROVED" | "DECLINED" | "ERROR" | "PENDING";
export type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export type CustomerType = "B2C" | "B2B";
export type OrderSyncStatus = "SYNCED" | "PENDING";

/** Sucursal de la orden: las reales mas el marcador legacy sin sucursal registrada */
export type OrderBranchId = BranchId | "no_registrada";

export type OrderItem = {
    productId: string;
    branchId?: BranchId | null;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    category?: string;
    brand?: string;
    priceTier: CustomerType;
    branch: { id: OrderBranchId; name: string };  // sucursal de esa linea
    availableAtPurchase: number;             // stock visto en esa sucursal
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
    transactionId?: string;   //Esto cuando ya se completa el pago   
    paymentAttempts?: number;  
    termsAccepted: boolean;

    schemaVersion: 2;
    userId: string;
    userName: string;
    role: Role;
    customerType: CustomerType;
    company?: { name: string; legalId: string };
    pricingTier: CustomerType;
    branch: { id: OrderBranchId; name: string };  // sucursal de referencia de la orden
    appliedConditions: string[];
    createdAtTs: number;
    syncStatus: OrderSyncStatus;
}
