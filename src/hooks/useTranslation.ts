import { useLanguageContext } from '../context/LanguageContext';
import { translations } from '@shared/lib/i18n';

/**
 * Hook for accessing translations in components
 *
 * @example
 * const { t, language, setLanguage, toggleLanguage } = useTranslation();
 *
 * // Simple translation
 * t('searchPlaceholder') // Returns: 'Search' or 'Пошук'
 *
 * // Nested translation
 * t('login.welcomeBack') // Returns: 'Welcome back to' or 'З поверненням до'
 *
 * // With interpolation
 * t('login.loginError', { error: 'Invalid credentials' })
 */
export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageContext();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key if translation not found
      }
    }

    let result = typeof value === 'string' ? value : key;

    // Replace parameters in the string (e.g., {error}, {email}, {days}, {hours})
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return result;
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
