import type { ReactNode } from 'react';
import type { Language } from '@shared/lib/i18n';
import { useAppSelector, useAppDispatch } from '@shared/store/hooks';
import { setLanguage as setLanguageAction } from '@features/Language/model/languageSlice';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Logic is moved to Redux, this provider might just initialize or sync if needed
  // Current implementation in slice reads from localStorage on init.
  return <>{children}</>;
}

export function useLanguageContext() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language.language as Language);

  const setLanguage = (lang: Language) => {
    dispatch(setLanguageAction(lang));
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'uk' : 'en';
    dispatch(setLanguageAction(newLang));
  };

  return { language, setLanguage, toggleLanguage };
}
