import type { Bill } from '../../models/Bill';
import styles from './styles.module.css';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation'; // ← ДОДАНО

interface BillCardProps {
    bill: Bill;
}

export const BillCard = ({ bill }: BillCardProps) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation(); // ← ГЛОБАЛЬНИЙ ПЕРЕКЛАД

    const getStatusColors = () => {
        const status = bill.status;
        const isSuccess = status === 'Paid' || status === 'Completed';
        const isWarning = status === 'Pending';
        const isError = status === 'Cancelled' || status === 'Refunded';
        const isProcessing = status === 'Processing';

        if (isSuccess) return { border: '#4caf50', bg: '#4caf50' };
        if (isWarning) return { border: '#ff9800', bg: '#ff9800' };
        if (isError) return { border: '#f44336', bg: '#f44336' };
        if (isProcessing) return { border: '#2196f3', bg: '#2196f3' };
        return { border: '#9e9e9e', bg: '#9e9e9e' };
    };

    const colors = getStatusColors();

    const formatCurrency = (amount: number) => `${amount.toFixed(0)} ₴`;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    // ← ПЕРЕКЛАД СТАТУСУ
    const translatedStatus = t(`billStatus.${bill.status.toLowerCase()}`) || bill.status;

    return (
        <div
            className={`${styles.billCard} ${isDarkMode ? styles.dark : ''}`}
            style={{
                borderLeftColor: colors.border,
                backgroundColor: isDarkMode ? '#1e1e1e' : 'white',
            }}
        >
            <div className={styles.amount} style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>
                {formatCurrency(bill.totalAmount)}
            </div>

            <div
                className={styles.status}
                style={{
                    backgroundColor: colors.bg,
                    color: 'white',
                }}
            >
                {translatedStatus.toUpperCase()} {/* ← ПЕРЕКЛАД */}
            </div>

            <div className={styles.date} style={{ color: isDarkMode ? '#aaa' : '#999' }}>
                {formatDate(bill.createdAt)}
            </div>

            {bill.updatedAt && (bill.status === 'Cancelled' || bill.status === 'Refunded') && (
                <div className={styles.date} style={{ color: isDarkMode ? '#aaa' : '#999' }}>
                    {formatDate(bill.updatedAt)}
                </div>
            )}
        </div>
    );
};