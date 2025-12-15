export interface PaymentOrder {
    id: number;
    providerTransactionId: string;
    provider: string;
    success: boolean;
    amountInMinorUnits: number;
    currency: string;
    createdAt: string;
    tokensAmount: number;
    deliveredAt: string;
    userId: number;
    updatedAt?: string;
}

export interface CreatePaymentIntentRequest {
    billId: number;
}

export interface CreatePaymentIntentResponse {
    success: boolean;
    paymentIntentId: string;
}

export interface UpdatePaymentStatusRequest {
    paymentIntentId: string;
    paymentMethod: string;
    action: 'confirm' | 'cancel';
}

export interface UpdatePaymentStatusResponse {
    success: boolean;
    status: string;
    paymentId?: number;
}

export interface CompletePaymentRequest {
    paymentIntentId: string;
}

export interface CompletePaymentResponse {
    success: boolean;
    paymentId: number;
}
