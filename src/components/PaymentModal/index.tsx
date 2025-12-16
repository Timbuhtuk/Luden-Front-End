import { useState, useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentService from '../../services/PaymentService';
import BillService from '../../services/BillService';
import { Loader } from '@shared/ui';
import styles from './PaymentModal.module.css';

// Замените на ваш публичный ключ Stripe (Publishable key из Stripe Dashboard)
const STRIPE_PUBLIC_KEY = 'pk_test_51SYPe5AZDP0okACh2KaRucLJiQLCkkxkSOCXrfJEek66DZ9RQbkCeLouIBi8Z4yWTHVn07graxujBZCRw4m5r0bh00r5yAKjjS';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    currency: string;
    currencySymbol: string;
    bonusPointsUsed?: number;
    cartItems: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
    onPaymentSuccess: () => void;
    language?: 'en' | 'uk';
    isDarkMode?: boolean;
}

interface PaymentFormProps {
    totalAmount: number;
    currency: string;
    currencySymbol: string;
    bonusPointsUsed?: number;
    cartItems: PaymentModalProps['cartItems'];
    onClose: () => void;
    onPaymentSuccess: () => void;
    language: 'en' | 'uk';
    isDarkMode: boolean;
}

const PaymentForm = ({
    totalAmount,
    currency,
    currencySymbol,
    bonusPointsUsed = 0,
    cartItems,
    onClose,
    onPaymentSuccess,
    language,
    isDarkMode,
}: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const initializationStarted = useRef(false);

    const t = language === 'uk' ? {
        orderSummary: 'Деталі замовлення',
        subtotal: 'Підсумок',
        total: 'Всього',
        paymentMethod: 'Спосіб оплати',
        pay: 'Оплатити',
        cancel: 'Скасувати',
        processing: 'Обробка...',
        creatingOrder: 'Створення замовлення...',
        paymentFailed: 'Помилка оплати',
    } : {
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        total: 'Total',
        paymentMethod: 'Payment Method',
        pay: 'Pay',
        cancel: 'Cancel',
        processing: 'Processing...',
        creatingOrder: 'Creating order...',
        paymentFailed: 'Payment failed',
    };

    useEffect(() => {
        if (initializationStarted.current) return;
        initializationStarted.current = true;

        const createBillAndPaymentIntent = async () => {
            try {
                setProcessing(true);
                setError(null);

                // Получаем ID пользователя из токена
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                if (!token) {
                    throw new Error('User not authenticated');
                }

                console.log('Raw token:', token);
                
                let userId: number;
                try {
                    const parts = token.split('.');
                    console.log('Token parts count:', parts.length);
                    if (parts.length !== 3) {
                        throw new Error('Invalid token format');
                    }
                    
                    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    while (base64.length % 4) {
                        base64 += '=';
                    }
                    
                    const payload = JSON.parse(atob(base64));
                    console.log('Token Payload:', payload);
                    userId = parseInt(payload.Id || payload.sub || payload.id);
                    console.log('Parsed UserID:', userId);
                    if (isNaN(userId)) {
                        throw new Error('Invalid user ID in token');
                    }
                } catch (decodeError) {
                    console.error('Token decode error:', decodeError);
                    throw new Error('Failed to decode authentication token');
                }

                // Создаем счет
                const bill = await BillService.createBill({
                    userId,
                    totalAmount,
                    status: 'Pending',
                    currency: currency || 'UAH',
                    bonusPointsUsed,
                    items: cartItems,
                });

                if (!bill) {
                    throw new Error('Failed to create bill');
                }

                // Создаем платежное намерение
                const paymentIntent = await PaymentService.createPaymentIntent(bill.id);

                if (!paymentIntent || !paymentIntent.paymentIntentId) {
                    throw new Error('Failed to create payment intent');
                }

                setClientSecret(paymentIntent.paymentIntentId);
            } catch (err: any) {
                setError(err.message || 'Failed to initialize payment');
                console.error('Payment initialization error:', err);
            } finally {
                setProcessing(false);
            }
        };

        createBillAndPaymentIntent();
    }, [totalAmount]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Подтверждаем платеж
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Завершаем платеж на бэкенде
                console.log('Payment succeeded, completing on backend...', paymentIntent.id);
                await PaymentService.completePayment(paymentIntent.id);

                // Уведомляем об успешной оплате
                onPaymentSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || t.paymentFailed);
            console.error('Payment error:', err);
        } finally {
            setProcessing(false);
        }
    };

    if (!clientSecret) {
        return (
            <div className={styles.loading}>
                {error ? (
                    <div className={`${styles.errorMessage} ${isDarkMode ? styles.dark : ''}`}>
                        <p>{error}</p>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={styles.cancelButton}
                            style={{ marginTop: '16px' }}
                        >
                            {t.cancel}
                        </button>
                    </div>
                ) : (
                    <>
                        <Loader size="medium" />
                        <p>{t.creatingOrder}</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.orderSummary}>
                <h3>{t.orderSummary}</h3>
                <div className={styles.summaryRow}>
                    <span>{t.subtotal}</span>
                    <span>{totalAmount.toFixed(2)} {currencySymbol}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>{t.total}</span>
                    <span>{totalAmount.toFixed(2)} {currencySymbol}</span>
                </div>
            </div>

            <div className={styles.paymentForm}>
                <div className={styles.formGroup}>
                    <label>{t.paymentMethod}</label>
                    <div className={styles.stripeElement}>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                                        '::placeholder': {
                                            color: isDarkMode ? '#b0b0b0' : '#666666',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className={`${styles.errorMessage} ${isDarkMode ? styles.dark : ''}`}>
                    {error}
                </div>
            )}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={processing}
                >
                    {t.cancel}
                </button>
                <button
                    type="submit"
                    className={styles.payButton}
                    disabled={!stripe || processing}
                >
                    {processing ? t.processing : `${t.pay} ${totalAmount.toFixed(2)} ${currencySymbol}`}
                </button>
            </div>
        </form>
    );
};

export const PaymentModal = ({
    isOpen,
    onClose,
    totalAmount,
    currency,
    currencySymbol,
    bonusPointsUsed = 0,
    cartItems,
    onPaymentSuccess,
    language = 'en',
    isDarkMode = false,
}: PaymentModalProps) => {
    const t = language === 'uk' ? {
        payment: 'Оплата',
    } : {
        payment: 'Payment',
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className={`${styles.overlay} ${isDarkMode ? styles.dark : ''}`}
                onClick={onClose}
            />
            <div className={`${styles.paymentModal} ${isDarkMode ? styles.dark : ''}`}>
                <div className={styles.header}>
                    <h2>{t.payment}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <Elements stripe={stripePromise}>
                    <PaymentForm
                        totalAmount={totalAmount}
                        currency={currency}
                        currencySymbol={currencySymbol}
                        bonusPointsUsed={bonusPointsUsed}
                        cartItems={cartItems}
                        onClose={onClose}
                        onPaymentSuccess={onPaymentSuccess}
                        language={language}
                        isDarkMode={isDarkMode}
                    />
                </Elements>
            </div>
        </>
    );
};
