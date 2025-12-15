import { en, type TranslationKeys } from './en';
import { uk } from './uk';

export const translations = {
  en,
  uk,
} as const;

export type Language = 'en' | 'uk';
export type TranslationKey = keyof TranslationKeys;

// Helper function to get translation by path
export function getTranslation(
  lang: Language,
  path: string
): string {
  const keys = path.split('.');
  let value: any = translations[lang];

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return path; // Return path if translation not found
    }
  }

  return typeof value === 'string' ? value : path;
}

// Export individual language translations
export { en } from './en';
export { uk } from './uk';
export type { TranslationKeys } from './en';

