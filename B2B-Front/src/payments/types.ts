// Código de resultado que devuelve el servicio
export type PaymentResultCode = "PAYMENT_APPROVED" | "PAYMENT_DECLINED";

// Datos de tarjeta
export type CardData = {
    holder: string;
    number: string;
    expiry: string;   // formato MM/AA
    cvv: string;
};

// Defición de la tarjeta
// Tarjeta tal como está definida en cards.json
export type Card = CardData & {
    label: string;
    balance: number;            // fondos disponibles en colones
    errorProbability: number;   // probabilidad (0 a 1) de fallo del sistema
};

// Request sque se manda al servicio del pago
export type PaymentRequest = {
    orderId: number;
    amount: number;
    currency: "CRC";
    card: CardData;
};

// Respuesta correcta del servicio
export type PaymentResponse = {
    transactionId: string;
    orderId: number;
    amount: number;
    currency: "CRC";
    status: PaymentResultCode;
    message: string;
    processedAt: string;
};