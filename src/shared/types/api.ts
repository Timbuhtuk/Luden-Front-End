export type ErrorPayload = string | string[];

export interface RequestConfig extends RequestInit {
    params?: Record<string, string | number | boolean | (string | number | boolean)[] | undefined>;
    withAuth?: boolean;
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: (attempt: number) => number;
    bodyType?: 'json' | 'form' | 'raw';
}

export type TokenProvider = () => string | null;

export interface ClientOptions {
    getToken?: TokenProvider;
    onUnauthorized?: () => Promise<void> | void;
    retries: number;
    retryDelayMs?: (attempt: number) => number;
}

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T | 'empty list';
    details?: ErrorPayload;
    errors?: ErrorPayload;
};

export type NormalizedApiResponse<T> = {
    success: boolean;
    status: number;
    message: string;
    data?: T;
    details?: string[];
    errors?: string[];
};

const toArray = (v?: ErrorPayload): string[] | undefined =>
    v == null ? undefined : Array.isArray(v) ? v : [v];

const isEmptyListMarker = (v: unknown): v is 'empty list' => v === 'empty list';

export const normalizeResponse = <T>(
    raw: ApiResponse<T>,
    status: number
): NormalizedApiResponse<T> => {
    const details = toArray(raw.details);
    const errors = toArray(raw.errors);
    const base: NormalizedApiResponse<T> = {
        success: raw.success,
        status,
        message: raw.message ?? '',
        details,
        errors,
    };

    if ('data' in raw) {
        if (isEmptyListMarker(raw.data)) return base;
        return { ...base, data: raw.data as T };
    }
    return base;
};

