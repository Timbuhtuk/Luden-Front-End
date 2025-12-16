import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '@shared/store/hooks';
import { toggleTheme } from '@features/Theme/model/themeSlice';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

    useEffect(() => {
        // Добавляем/удаляем класс на body
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);

    return <>{children}</>;
};

export const useTheme = () => {
    const dispatch = useAppDispatch();
    const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

    const toggleDarkMode = () => {
        dispatch(toggleTheme());
    };

    return { isDarkMode, toggleDarkMode };
};
