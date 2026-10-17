import cardsData from "./cards.json";
import type {
    Card,
    CardData,
    PaymentRequest,
    PaymentResponse,
} from "./types";

const cards = cardsData as Card[];

const PROCESSING_DELAY_MS = 1500;
const ERROR_EXTRA_DELAY_MS = 2000;
const BALANCES_KEY = "sandbox:balances";

/**
Esto es para lanzar el error. Utiliza una clase de de typescript para dar una mejor respuesta y que pueda ser más específica que una excepción
 */
export class PaymentServiceError extends Error {
    code: "SERVICE_UNAVAILABLE" | "INVALID_REQUEST";

    constructor(message: string, code: PaymentServiceError["code"]) {
        super(message);
        this.name = "PaymentServiceError";
        this.code = code;
    }
}
//Para simular tiempo de espera
const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

// Quita posibles espacios entre los números de la tarjeta 1111 222 -> 11112222
const normalizeNumber = (value: string) => value.replace(/[\s-]/g, "");

/* Esto es para hacer los saldos persistentes a lo largo del programa.
    El saldo se guarda en ejecución y no se modifica el json ya que no se guardan datos
*/

type Balances = Record<string, number>;

function loadBalances(): Balances {
    try {
        const raw = window.localStorage.getItem(BALANCES_KEY);
        return raw ? (JSON.parse(raw) as Balances) : {};
    } catch {
        return {};
    }
}

function saveBalances(balances: Balances): void {
    try {
        window.localStorage.setItem(BALANCES_KEY, JSON.stringify(balances));
    } catch {
        // Si el almacenamiento no esta disponible, se ignora: los saldos
        // vuelven a los valores por defecto de cards.json.
    }
}

// Busca el salod actual. Usa el guardado y si falla llama al del json
export function getCardBalance(card: Card): number {
    return loadBalances()[card.number] ?? card.balance;
}

// Solo para probar. Resetea los saldos a los originales
export function resetSandboxBalances(): void {
    window.localStorage.removeItem(BALANCES_KEY);
}

// Lista con todas las tarjetas
export function getCards(): Card[] {
    return cards;
}


//Se valida que el request sea válido. Que tenga un número de solicitud y un monto válido
function validateRequest(request: PaymentRequest): void {
    if (!Number.isInteger(request.orderId) || request.orderId <= 0) {
        throw new PaymentServiceError("Número de orden inválido", "INVALID_REQUEST");
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
        throw new PaymentServiceError("Monto inválido", "INVALID_REQUEST");
    }
}

// Es la comprobación de la tarjeta.
// Solo verifica el vencimiento y el cvv pero podría agregar el nombre también
function findMatchingCard(card: CardData): Card | null {
    const found = cards.find(
        (c) => c.number === normalizeNumber(card.number)
    );
    if (!found) return null;
    if (found.expiry !== card.expiry.trim() || found.cvv !== card.cvv.trim()) {
        return null;
    }
    return found;
}

//Da la respuesta del pago. Genera el id de transacción y todos los val
function buildResponse(
    request: PaymentRequest,
    approved: boolean,
    message: string
): PaymentResponse {
    return {
        transactionId: crypto.randomUUID(),
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        status: approved ? "PAYMENT_APPROVED" : "PAYMENT_DECLINED",
        message,
        processedAt: new Date().toISOString(),
    };
}



/*
Con esto se simula todo lo del pago.
Hace las verificaciones.
Primero, busca que la tarjeta sea correcta y valida los datos. PAYMENT_DECLINED
Segundo, busca ve si falla por probabilidad. PaymentServiceError
Tercero, valida los fondos. PAYMENT_DECLINED
Cuarto, hace el descuento. PAYMENT_APPROVED
*/
export async function processPayment(
    request: PaymentRequest
): Promise<PaymentResponse> {
    validateRequest(request);

    await wait(PROCESSING_DELAY_MS);

    const card = findMatchingCard(request.card);
    if (!card) {
        return buildResponse(
            request,
            false,
            "No pudimos validar los datos de la tarjeta"
        );
    }

    // La probabilidad es solo para fallos del sistema
    if (Math.random() < card.errorProbability) {
        await wait(ERROR_EXTRA_DELAY_MS);
        throw new PaymentServiceError(
            "El servicio de pagos no respondió",
            "SERVICE_UNAVAILABLE"
        );
    }

    // Comprobación de fondos
    const currentBalance = getCardBalance(card);
    if (request.amount > currentBalance) {
        return buildResponse(request, false, "Fondos insuficientes");
    }

    
    const balances = loadBalances();
    balances[card.number] = currentBalance - request.amount;
    saveBalances(balances);

    return buildResponse(request, true, "Pago aprobado");
}