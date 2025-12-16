import BaseService from './BaseService';
import type { Bill } from '../models/Bill';

class BillService extends BaseService {
    /**
     * Получение всех счетов текущего пользователя
     */
    async getUserBills() {
        return this.request<Bill[]>('/bill/user', { method: 'GET' });
    }

    /**
     * Получение счета по ID
     */
    async getBillById(id: number) {
        return this.request<Bill>(`/bill/${id}`, { method: 'GET' });
    }

    /**
     * Создание нового счета
     */
    async createBill(data: { 
        userId: number; 
        totalAmount: number; 
        status: string; 
        currency?: string; 
        bonusPointsUsed?: number;
        items?: Array<{ productId: number; quantity: number; price: number }>;
    }) {
        return this.request<Bill>('/bill', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Обновление счета
     */
    async updateBill(id: number, bill: Bill) {
        return this.request<void>(`/bill/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bill),
        });
    }

    /**
     * Удаление счета
     */
    async deleteBill(id: number) {
        return this.request<void>(`/bill/${id}`, {
            method: 'DELETE',
        });
    }
}

export default new BillService();
