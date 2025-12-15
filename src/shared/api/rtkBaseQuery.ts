import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@shared/config';
import { normalizeResponse, type ApiResponse } from '@shared/types/api';
import { toSearchParams } from './params-utils';

// Расширяем FetchArgs для поддержки наших опций
interface CustomFetchArgs extends FetchArgs {
  withAuth?: boolean;
  timeoutMs?: number;
  retries?: number;
  bodyType?: 'json' | 'form' | 'raw';
}

// Тип ошибки для RTK Query
type CustomFetchBaseQueryError = FetchBaseQueryError & {
  data?: {
    success: false;
    status: number;
    message: string;
    errors?: string[];
    details?: string[];
  };
};

/**
 * Кастомный baseQuery с поддержкой специфики API
 */
export const rtkBaseQuery: BaseQueryFn<
  CustomFetchArgs,
  unknown,
  CustomFetchBaseQueryError
> = async (args) => {
  const {
    url,
    method = 'GET',
    withAuth = true,
    timeoutMs = 15000,
    retries = 0,
    params,
    bodyType = 'json',
    headers: restHeaders,
    ...rest
  } = args as CustomFetchArgs;

  // Построение URL с параметрами
  let fullUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const qs = toSearchParams(params).toString();
    if (qs) fullUrl += `?${qs}`;
  }

  // Подготовка headers
  const headers: Record<string, string> = {};

  // Авторизация
  if (withAuth) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Подготовка body
  let finalBody = rest.body;
  
  if (rest.body !== undefined && rest.body !== null) {
    if (bodyType === 'form' && !(rest.body instanceof FormData)) {
      // Если bodyType = 'form', но body не FormData, конвертируем объект в FormData
      const formData = new FormData();
      if (typeof rest.body === 'object') {
        Object.entries(rest.body as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          }
        });
      }
      finalBody = formData;
    } else if (bodyType === 'raw') {
      // Для raw bodyType сериализуем примитивные типы в JSON
      headers['Content-Type'] = 'application/json';
      if (typeof rest.body === 'string' || typeof rest.body === 'number' || typeof rest.body === 'boolean') {
        finalBody = JSON.stringify(rest.body);
      } else {
        // Для объектов и других типов - сериализуем как обычно
        finalBody = JSON.stringify(rest.body);
      }
    } else if (!(rest.body instanceof FormData) && typeof rest.body === 'object') {
      // Для JSON объектов - сериализуем в строку
      headers['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(rest.body);
    } else if (!(rest.body instanceof FormData)) {
      // Для других типов (строки, числа и т.д.) - сериализуем в JSON
      headers['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(rest.body);
    }
  }

  // Объединяем headers
  const finalHeaders: HeadersInit = {
    ...headers,
    ...(restHeaders as Record<string, string>),
  };

  // Выполнение запроса с retry логикой
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Задержка перед retry (экспоненциальная)
      const delay = 300 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const { body: _, ...fetchOptions } = rest;
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        method,
        headers: finalHeaders,
        signal: controller.signal,
        body: finalBody,
      });

      clearTimeout(timeoutId);

      const status = response.status;
      const contentType = response.headers.get('content-type') || '';

      // Обработка 401
      if (status === 401 && withAuth) {
        // Очищаем токен и возвращаем ошибку
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        return {
          error: {
            status: 401,
            data: {
              success: false,
              status: 401,
              message: 'Необхідна авторизація',
              errors: ['Необхідна авторизація'],
            },
          } as CustomFetchBaseQueryError,
        };
      }

      // Обработка не-JSON ответов (204, файлы и т.д.)
      if (status === 204 || !contentType.includes('application/json')) {
        const text = await response.text().catch(() => '');

        if (!response.ok) {
          return {
            error: {
              status: status,
              data: {
                success: false,
                status,
                message: text || response.statusText || `HTTP ${status}`,
                errors: [text || response.statusText || `HTTP ${status}`],
              },
            } as CustomFetchBaseQueryError,
          };
        }

        return { data: text || 'OK' };
      }

      // Обработка JSON ответов
      let raw: any;
      try {
        raw = await response.json();
      } catch {
        return {
          error: {
            status: status,
            data: {
              success: false,
              status,
              message: 'Invalid JSON response',
              errors: ['Invalid JSON response'],
            },
          } as CustomFetchBaseQueryError,
        };
      }

      // Если ответ не соответствует стандартной структуре API (например, просто { token: "..." }),
      // обрабатываем его как успешный ответ с данными
      if (!('success' in raw) && response.ok) {
        // Прямой ответ от сервера без обертки API
        return {
          data: raw,
          meta: {
            success: true,
            status,
            message: '',
          },
        };
      }

      // Нормализация ответа со стандартной структурой API
      const normalized = normalizeResponse(raw as ApiResponse<unknown>, status);

      // Проверка на ошибку
      if (!response.ok || normalized.success === false) {
        return {
          error: {
            status: normalized.status,
            data: {
              success: false,
              status: normalized.status,
              message: normalized.message || response.statusText || `HTTP ${status}`,
              errors: normalized.errors ?? normalized.details ?? [normalized.message || `HTTP ${status}`],
              details: normalized.details,
            },
          } as CustomFetchBaseQueryError,
        };
      }

      // Успешный ответ - извлекаем data и обрабатываем "empty list"
      let data = normalized.data;
      
      // Обработка "empty list" для пустых коллекций
      if (data === 'empty list') {
        data = [];
      }

      return {
        data,
        meta: {
          success: normalized.success,
          status: normalized.status,
          message: normalized.message,
          errors: normalized.errors,
          details: normalized.details,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');

      // Если это последняя попытка, возвращаем ошибку
      if (attempt === retries) {
        return {
          error: {
            status: 0,
            data: {
              success: false,
              status: 0,
              message: lastError.message,
              errors: [lastError.message],
            },
          } as CustomFetchBaseQueryError,
        };
      }
    }
  }

  // Не должно сюда дойти, но на всякий случай
  return {
    error: {
      status: 0,
      data: {
        success: false,
        status: 0,
        message: lastError?.message || 'Unknown error',
        errors: [lastError?.message || 'Unknown error'],
      },
    } as CustomFetchBaseQueryError,
  };
};

