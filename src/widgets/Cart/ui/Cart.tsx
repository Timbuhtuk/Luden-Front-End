import { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import type { CartItem } from '@shared/types';
import { translations } from '@shared/lib/i18n';
import { CartItemComponent } from './CartItem';
import styles from './styles.module.css';

type Country = {
    nameKey: string;
    currency: string;
    symbol: string;
};

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
    const countries: Country[] = [
        { nameKey: 'ukraine', currency: 'UAH', symbol: '₴' },
        { nameKey: 'usa', currency: 'USD', symbol: '$' },
        { nameKey: 'poland', currency: 'PLN', symbol: 'zł' },
        { nameKey: 'spain', currency: 'EUR', symbol: '€' },
        { nameKey: 'bulgaria', currency: 'BGN', symbol: 'лв' },
        { nameKey: 'germany', currency: 'EUR', symbol: '€' },
        { nameKey: 'france', currency: 'EUR', symbol: '€' },
        { nameKey: 'italy', currency: 'EUR', symbol: '€' },
        { nameKey: 'czechRepublic', currency: 'CZK', symbol: 'Kč' },
        { nameKey: 'romania', currency: 'RON', symbol: 'lei' },
    ];

    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [bonusInput, setBonusInput] = useState('');

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

    const formatPrice = (game: { price?: string; priceValue?: number }): string => {
        const price = getPrice(game);
        return `${price.toLocaleString()} ${selectedCountry.symbol}`;
    };

    const calculateTotal = (): number => {
        return items.reduce((sum, item) => {
            const price = getPrice(item.game);
            return sum + price * item.quantity;
        }, 0);
    };

    const total = calculateTotal();
    const bonuses = Math.floor(total * 0.1);

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
                                        {countries.map(country => (
                                            <button
                                                key={country.nameKey}
                                                className={styles.countryOption}
                                                onClick={() => {
                                                    setSelectedCountry(country);
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
                                {total} {selectedCountry.symbol}
                            </span>
                        </div>

                        <div className={styles.bonusSection}>
                            <h3>{cart.bonusesLuden}</h3>
                            <input
                                type="text"
                                placeholder={cart.useAvailableBonuses}
                                value={bonusInput}
                                onChange={e => setBonusInput(e.target.value)}
                                className={styles.bonusInput}
                            />
                            <button className={styles.applyBtn}>{cart.apply}</button>
                        </div>

                        <div className={styles.finalTotal}>
                            <div className={styles.finalRow}>
                                <span>{cart.totalAmount}</span>
                                <span className={styles.finalPrice}>
                                    {total} {selectedCountry.symbol}
                                </span>
                            </div>
                            <div className={styles.rewardRow}>
                                <span>
                                    {cart.reward} {bonuses} {cart.bonusesLudenReward}
                                </span>
                            </div>
                        </div>

                        <button className={styles.paymentBtn}>{cart.goToPayment}</button>
                    </div>
                </div>
            </div>
        </>
    );
};