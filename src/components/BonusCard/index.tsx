import type { Bonus } from '../../models';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { MdPercent, MdMonetizationOn, MdAccessTime } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation'; // ← ДОДАНО

interface BonusCardProps {
    bonus: Bonus;
}

export const BonusCard = ({ bonus }: BonusCardProps) => {
    const { isDarkMode } = useTheme();
    const { t, language } = useTranslation(); // ← ГЛОБАЛЬНИЙ ПЕРЕКЛАД
    const [timeLeft, setTimeLeft] = useState<string>('');

    // === Визначення іконки за назвою (перекладена назва) ===
    const getIcon = () => {
        const bonusKey = bonus.name.toLowerCase();
        if (bonusKey.includes('discount') || bonusKey.includes('знижка')) {
            return <MdPercent className={styles.bonusIcon} />;
        }
        if (bonusKey.includes('coins') || bonusKey.includes('монет')) {
            return <MdMonetizationOn className={styles.bonusIcon} />;
        }
        if (bonusKey.includes('trial') || bonusKey.includes('пробна')) {
            return <MdAccessTime className={styles.bonusIcon} />;
        }
        return null;
    };

    // === Парсинг дати з опису ===
    const parseDateFromText = (text: string): Date | null => {
        const dateRegex =
            /(\d{1,2}\s+\w+\s+\d{4})|(\w+\s+\d{1,2},?\s*\d{4})|(\d{4}-\d{1,2}-\d{1,2})/;
        const match = text.match(dateRegex);
        if (match) {
            const parsedDate = new Date(match[0]);
            if (!isNaN(parsedDate.getTime())) return parsedDate;
        }
        return null;
    };

    // === Таймер ===
    useEffect(() => {
        const updateTimer = () => {
            const expiryDate = parseDateFromText(bonus.description);
            if (!expiryDate) {
                setTimeLeft('');
                return;
            }

            const now = new Date();
            const diff = expiryDate.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                // Використовуємо переклад для "d" і "h"
                const daysLabel = language === 'uk' ? 'д' : 'd';
                const hoursLabel = language === 'uk' ? 'год' : 'h';
                setTimeLeft(`${days}${daysLabel} ${hours}${hoursLabel} ${t('bonus.timeLeft').split(' ')[2] || 'left'}`);
            } else {
                setTimeLeft(t('bonus.expired')); // ← ПЕРЕКЛАД
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 3600000); // кожну годину
        return () => clearInterval(interval);
    }, [bonus.description, language, t]);

    // === Переклад назви бонусу (опціонально: через ключ) ===
    // Якщо бонуси мають фіксовані назви, краще використовувати ключі
    const translatedBonusName = (() => {
        const key = bonus.name.toLowerCase();
        if (key.includes('10%')) return t('bonus.discount10');
        if (key.includes('50')) return t('bonus.coins50');
        if (key.includes('trial')) return t('bonus.freeTrial');
        return bonus.name; // fallback
    })();

    return (
        <div
            className={`${styles.bonusItem} ${isDarkMode ? styles.dark : ''}`}
            style={{
                background: isDarkMode
                    ? 'linear-gradient(135deg, #2c1a1d, #3a1f22)'
                    : 'linear-gradient(135deg, #ffecd2, #fcb69f)',
            }}
        >
            {getIcon()}
            <span className={styles.bonusName} style={{ color: isDarkMode ? '#ff8a80' : '#333' }}>
                {translatedBonusName} {/* ← ПЕРЕКЛАД */}
            </span>
            <span className={styles.bonusDescription} style={{ color: isDarkMode ? '#ccc' : '#555' }}>
                {bonus.description}
            </span>
            {timeLeft && (
                <span
                    className={styles.bonusTimer}
                    style={{
                        backgroundColor: isDarkMode ? '#871c1c' : '#c54c4c',
                        color: '#fff',
                    }}
                >
                    {timeLeft}
                </span>
            )}
        </div>
    );
};