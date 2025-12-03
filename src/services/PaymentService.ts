import BaseService from './BaseService';
import type {
    CreatePaymentIntentResponse,
    UpdatePaymentStatusRequest,
    UpdatePaymentStatusResponse,
    CompletePaymentResponse,
} from '../models/Payment';

class PaymentService extends BaseService {
    /**
     * Создание платежного намерения Stripe
     * @param billId - ID счета для оплаты
     */
    async createPaymentIntent(billId: number): Promise<CreatePaymentIntentResponse | null> {
        return this.request<CreatePaymentIntentResponse>('/payment/stripe/create', {
            method: 'POST',
            body: JSON.stringify(billId),
        });
    }

    /**
     * Обновление статуса платежа (подтверждение/отмена)
     * @param request - данные для обновления платежа
     */
    async updatePaymentStatus(
        request: UpdatePaymentStatusRequest
    ): Promise<UpdatePaymentStatusResponse | null> {
        return this.request<UpdatePaymentStatusResponse>('/payment/stripe/update-status', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    /**
     * Завершение платежа
     * @param paymentIntentId - ID платежного намерения Stripe
     */
    async completePayment(paymentIntentId: string): Promise<CompletePaymentResponse | null> {
        return this.request<CompletePaymentResponse>('/payment/stripe/complete', {
            method: 'POST',
            body: JSON.stringify(paymentIntentId),
        });
    }
}

export default new PaymentService();
