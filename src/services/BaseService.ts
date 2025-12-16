import { API_BASE_URL } from '@shared/config';

class BaseService {
    static noAuth = [
        '/authorization/login',
        '/authorization/register',
        '/authorization/google',
    ];

    private getToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
        const endpointLower = endpoint.toLowerCase();
        const skipAuth = BaseService.noAuth.some(p => endpointLower.includes(p.toLowerCase()));

        const headers: HeadersInit = {
            ...(options.headers || {})
        };

        // Добавляем Content-Type только если не FormData
        if (!(options.body instanceof FormData)) {
            (headers as any)['Content-Type'] = 'application/json';
        }

        if (!skipAuth) {
            const token = this.getToken();
            if (!token) throw new Error('Необхідна авторизація');
            (headers as any).Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!res.ok) {
            if (res.status === 401) throw new Error('Необхідна авторизація');
            const text = await res.text();
            throw new Error(`Помилка API ${res.status}: ${text}`);
        }

        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
            const txt = await res.text();
            return txt ? JSON.parse(txt) : null;
        }
        return null;
    }
}

export default BaseService;
