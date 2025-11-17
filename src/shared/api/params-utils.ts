import type { RequestConfig } from '@shared/types/api';

/**
 * Утилиты для сериализации параметров запроса
 * Используются в apiClient и rtkBaseQuery
 */

export const isDate = (v: unknown): v is Date => v instanceof Date;

export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v != null && typeof v === 'object' && !Array.isArray(v) && !isDate(v);

export const serializeParamValue = (v: unknown): string => {
  if (v === null) return 'null';
  if (isDate(v)) return v.toISOString();
  if (isPlainObject(v)) return JSON.stringify(v);
  return String(v);
};

export const toSearchParams = (params?: RequestConfig['params']) => {
  const sp = new URLSearchParams();
  if (!params) return sp;

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    if (Array.isArray(v)) {
      v.forEach((i) => {
        if (i === undefined) return;
        sp.append(k, serializeParamValue(i));
      });
    } else {
      sp.append(k, serializeParamValue(v));
    }
  });

  return sp;
};

