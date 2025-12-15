import type { Bonus } from '../../models';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { MdPercent, MdMonetizationOn, MdAccessTime } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';

interface BonusCardProps {
    bonus: Bonus;
}

export const BonusCard = ({ bonus }: BonusCardProps) => {
    const { isDarkMode } = useTheme();
    const [timeLeft, setTimeLeft] = useState<string>('');

    const getIcon = () => {
        switch (bonus.name.toLowerCase()) {
            case '10% discount':
                return <MdPercent className={styles.bonusIcon} />;
            case '50 coins':
                return <MdMonetizationOn className={styles.bonusIcon} />;
            case 'free trial':
                return <MdAccessTime className={styles.bonusIcon} />;
            default:
                return null;
        }
    };

    useEffect(() => {
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
                const hours = Math.floor(
                    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                setTimeLeft(`${days}d ${hours}h left`);
            } else {
                setTimeLeft('Expired');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 3600000);
        return () => clearInterval(interval);
    }, [bonus.description]);

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
                {bonus.name}
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