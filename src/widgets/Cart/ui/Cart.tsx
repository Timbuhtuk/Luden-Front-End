import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import type { CartItem } from '@shared/types';
import { translations } from '@shared/lib/i18n';
import { CartItemComponent } from './CartItem';
import { PaymentModal } from '../../../components';
import styles from './styles.module.css';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setCurrency } from '@features/Currency/model/currencySlice';
import { COUNTRIES } from '@shared/const/countries';
import { rtkApi } from '@shared/api/rtkApi';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (gameId: number, quantity: number) => void;
    onRemoveItem: (gameId: number) => void;
    onToggleAccountType: (gameId: number) => void;
    onClearCart: () => void;
    language?: 'en' | 'uk';
    isDarkMode?: boolean;
}

export const Cart = ({
                         isOpen,
                         onClose,
                         items,
                         onUpdateQuantity,
                         onRemoveItem,
                         onToggleAccountType,
                         onClearCart,
                         language = 'en',
                         isDarkMode = false,
                     }: CartProps) => {
    const dispatch = useAppDispatch();
    const selectedCountry = useAppSelector(state => state.currency.selectedCountry);
    const { data: userProfile } = rtkApi.useGetUserProfileQuery();
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [bonusPointsUsed, setBonusPointsUsed] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const t = translations[language];
    const cart = t.cart;
    const countryNames = t.countries;

    const getPrice = (game: { price?: string; priceValue?: number }): number => {
        // Приоритет: используем priceValue (оригинальная цена из API), если доступна
        if (game.priceValue !== undefined && game.priceValue !== null) {
            return game.priceValue;
        }
        // Fallback: парсим строку цены
        if (!game.price) return 0;
        // Удаляем все нецифровые символы (включая пробелы, запятые, точки, валютные символы)
        // Это обрабатывает форматы: "1 39 €", "139 €", "1,39 €", "1.39 €", "1 234,56 €"
        // Просто извлекаем все цифры и объединяем их
        const digitsOnly = game.price.replace(/\D/g, '');
        const price = parseInt(digitsOnly, 10);
        return isNaN(price) ? 0 : price;
    };

    const calculateTotal = (): number => {
        const totalUah = items.reduce((sum, item) => {
            const price = getPrice(item.game);
            return sum + price * item.quantity;
        }, 0);
        return totalUah * selectedCountry.rate;
    };

    const total = calculateTotal();
    
    // Calculate total after bonus deduction
    // 1 bonus point = 0.01 UAH (assuming 100 points = 1 UAH for simplicity, or adjust logic as needed)
    // Let's assume 1 bonus point = 1 unit of currency for now, or use a conversion rate.
    // Based on backend logic "bonusPoints = (int)Math.Floor(amountInUah * 0.1m)", 1 UAH spent gives 0.1 points.
    // Usually 1 point = 1 unit of currency in redemption or a specific ratio.
    // Let's assume 1 Bonus Point = 1 UAH discount.
    const discountFromBonuses = bonusPointsUsed * selectedCountry.rate; 
    const finalTotal = Math.max(0, total - discountFromBonuses);
    
    const formattedTotal = total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const formattedFinalTotal = finalTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    
    const bonuses = Math.floor((finalTotal / selectedCountry.rate) * 0.1); // Bonuses calculated on paid amount

    const handleGoToPayment = () => {
        if (items.length === 0) return;
        console.log('Opening payment modal...', { total: finalTotal, items, bonusPointsUsed });
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        console.log('Payment successful!');
        onClearCart();
        setShowPaymentModal(false);
        alert(language === 'uk' ? 'Оплата успішна!' : 'Payment successful!');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isDarkMode ? styles.dark : ''}`}
                onClick={onClose}
            />

            {/* Cart popup */}
            <div className={`${styles.cartPopup} ${isDarkMode ? styles.dark : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>{cart.shoppingCart}</h2>
                    <button className={styles.continueBtn} onClick={onClose}>
                        {cart.continueShopping}
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Left side - Items */}
                    <div className={styles.itemsList}>
                        {items.length === 0 ? (
                            <p className={styles.emptyCart}>{cart.emptyCart}</p>
                        ) : (
                            <>
                                {items.map(item => (
                                    <CartItemComponent
                                        key={item.game.id}
                                        item={item}
                                        language={language}
                                        isDarkMode={isDarkMode}
                                        currencySymbol={selectedCountry.symbol}
                                        exchangeRate={selectedCountry.rate}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemoveItem={onRemoveItem}
                                        onToggleAccountType={onToggleAccountType}
                                    />
                                ))}
                                <button className={styles.clearCartBtn} onClick={onClearCart}>
                                    {cart.clearCart}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right side - Summary */}
                    <div className={styles.summary}>
                        <div className={styles.countrySelect}>
                            <label>{cart.country}</label>
                            <div className={styles.dropdown}>
                                <button
                                    className={styles.countryBtn}
                                    onClick={() => setShowCountryDropdown(prev => !prev)}
                                >
                                    {countryNames[selectedCountry.nameKey as keyof typeof countryNames]} ({selectedCountry.currency})
                                    <MdKeyboardArrowDown
                                        className={`${styles.arrow} ${showCountryDropdown ? styles.rotated : ''}`}
                                    />
                                </button>
                                {showCountryDropdown && (
                                    <div className={`${styles.countryDropdown} ${styles.visible}`}>
                                        {COUNTRIES.map(country => (
                                            <button
                                                key={country.nameKey}
                                                className={styles.countryOption}
                                                onClick={() => {
                                                    dispatch(setCurrency(country));
                                                    setShowCountryDropdown(false);
                                                }}
                                            >
                                                {countryNames[country.nameKey as keyof typeof countryNames]} ({country.currency})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.totalRow}>
                            <span>{cart.total}</span>
                            <span className={styles.totalPrice}>
                                {formattedTotal} {selectedCountry.symbol}
                            </span>
                        </div>

                        <div className={styles.bonusSection}>
                            <h3>{cart.bonusesLuden}</h3>
                            {userProfile ? (
                                <div className={styles.bonusControl}>
                                    <div className={styles.bonusInfo}>
                                        <span>{cart.available}: {userProfile.bonusPoints}</span>
                                        <span>{cart.used}: {bonusPointsUsed}</span>
                                    </div>
                                    <div className={styles.sliderContainer}>
                                        <input
                                            type="range"
                                            min="0"
                                            max={Math.min(userProfile.bonusPoints, Math.floor(total / selectedCountry.rate))} 
                                            value={bonusPointsUsed}
                                            onChange={e => setBonusPointsUsed(parseInt(e.target.value))}
                                            className={styles.bonusSlider}
                                        />
                                        <div 
                                            className={styles.sliderFill} 
                                            style={{ width: `${(bonusPointsUsed / Math.min(userProfile.bonusPoints, Math.floor(total / selectedCountry.rate))) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <p>{cart.loginToUseBonuses || 'Login to use bonuses'}</p>
                            )}
                        </div>

                        <div className={styles.finalTotal}>
                            <div className={styles.finalRow}>
                                <span>{cart.totalAmount}</span>
                                <div className={styles.priceColumn}>
                                    {bonusPointsUsed > 0 && (
                                        <span className={styles.originalPrice}>
                                            {formattedTotal} {selectedCountry.symbol}
                                        </span>
                                    )}
                                    <span className={styles.finalPrice}>
                                        {formattedFinalTotal} {selectedCountry.symbol}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.rewardRow}>
                                <span>
                                    {cart.reward} {bonuses} {cart.bonusesLudenReward}
                                </span>
                            </div>
                        </div>

                        <button
                            className={styles.paymentBtn}
                            onClick={handleGoToPayment}
                            disabled={items.length === 0}
                        >
                            {cart.goToPayment}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    console.log('Closing payment modal');
                    setShowPaymentModal(false);
                }}
                totalAmount={finalTotal}
                currency={selectedCountry.currency}
                currencySymbol={selectedCountry.symbol}
                bonusPointsUsed={bonusPointsUsed}
                cartItems={items.map(item => ({
                    productId: item.game.id,
                    quantity: item.quantity,
                    price: getPrice(item.game),
                }))}
                onPaymentSuccess={handlePaymentSuccess}
                language={language}
                isDarkMode={isDarkMode}
            />
        </>
    );
};