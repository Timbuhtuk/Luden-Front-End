// src/services/UserService.ts
import BaseService from './BaseService';
import type { Product } from '../models/Bill';

type LoginData = {
    email?: string;
    password?: string;
    googleJwtToken?: string;
};

type RegisterData = {
    email?: string;
    password?: string;
    googleJwtToken?: string;
};

class UserService extends BaseService {
    async login(data: LoginData) {
        return this.request<{ token?: string; message?: string }>('/authorization/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async register(data: RegisterData) {
        return this.request<{ token?: string; message?: string }>('/authorization/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    /**
     * Получение профиля
     */
    async getProfile() {
        return this.request<{
            username: string;
            email: string;
            role: string;
            createdAt: string;
            updatedAt?: string;
            avatarUrl?: string; // Прямая ссылка (с token)
            bills: Array<{
                id: number;
                userId: number;
                totalAmount: number;
                status: 'Pending' | 'Paid' | 'Cancelled' | 'Refunded' | 'Processing' | 'Completed';
                createdAt: string;
                updatedAt?: string;
                billItems: Array<{
                    id: number;
                    billId: number;
                    productId: number;
                    quantity: number;
                    price: number;
                    product?: {
                        id: number;
                        name: string;
                        description: string;
                        price: number;
                        stock: number;
                        createdAt: string;
                        updatedAt?: string;
                    };
                }>;
            }>;
            products: Array<{
                id: number;
                name: string;
                description: string;
                price: number;
                stock: number;
                createdAt: string;
                updatedAt?: string;
            }>;
        }>('/user/profile', { method: 'GET' });
    }

    /**
     * Обновление профиля (включая аватар)
     */
    async updateUser(data: { username?: string; email?: string; avatar?: File }) {
        const formData = new FormData();

        if (data.username) formData.append('username', data.username);
        if (data.email) formData.append('email', data.email);
        if (data.avatar) formData.append('avatar', data.avatar);

        return this.request<{
            message: string;
            username: string;
            email: string;
            avatarUrl?: string; // Прямая ссылка
        }>('/user/update', {
            method: 'PUT',
            body: formData,
            headers: {},
        });
    }

    async getUserProducts() {
        return this.request<Product[]>('/user/products', { method: 'GET' });
    }
}

export default new UserService();