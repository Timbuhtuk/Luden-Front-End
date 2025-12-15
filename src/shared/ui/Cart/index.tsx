import { useState } from 'react';
import { MdDelete, MdKeyboardArrowDown } from 'react-icons/md';
import type { CartItem } from '@shared/types';
import { translations } from '@shared/lib/i18n';
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

    const parsePrice = (priceStr?: string): number => {
        if (!priceStr) return 0;
        const match = priceStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    const formatPrice = (priceStr?: string): string => {
        const price = parsePrice(priceStr);
        return `${price} ${selectedCountry.symbol}`;
    };

    const calculateTotal = (): number => {
        return items.reduce((sum, item) => {
            const price = parsePrice(item.game.price);
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
                                    <div key={item.game.id} className={styles.cartItem}>
                                        <img
                                            src={item.game.image}
                                            alt={item.game.title}
                                            className={styles.gameImage}
                                        />
                                        <div className={styles.itemInfo}>
                                            <h3>{item.game.title}</h3>
                                            <div className={styles.accountType}>
                                                <button
                                                    className={styles.accountTypeBtn}
                                                    onClick={() => onToggleAccountType(item.game.id)}
                                                >
                                                    {item.forMyAccount ? cart.forMyAccount : cart.forGift}
                                                    <MdKeyboardArrowDown />
                                                </button>
                                            </div>
                                            <div className={styles.quantityControl}>
                                                <span>{cart.total}</span>
                                                <div className={styles.quantityButtons}>
                                                    <button
                                                        onClick={() =>
                                                            onUpdateQuantity(
                                                                item.game.id,
                                                                Math.max(1, item.quantity - 1)
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button
                                                        onClick={() =>
                                                            onUpdateQuantity(item.game.id, item.quantity + 1)
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className={styles.itemPrice}>
                                                    {formatPrice(item.game.price)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => onRemoveItem(item.game.id)}
                                            aria-label="Delete item"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
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