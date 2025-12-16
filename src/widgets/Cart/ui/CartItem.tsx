import { useState } from 'react';
import { MdDelete, MdKeyboardArrowDown } from 'react-icons/md';
import type { CartItem as CartItemType } from '@shared/types';
import { translations } from '@shared/lib/i18n';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';
import styles from './styles.module.css';

interface CartItemProps {
    item: CartItemType;
    language: 'en' | 'uk';
    isDarkMode: boolean;
    currencySymbol: string;
    exchangeRate?: number;
    onUpdateQuantity: (gameId: number, quantity: number) => void;
    onRemoveItem: (gameId: number) => void;
    onToggleAccountType: (gameId: number) => void;
}

export const CartItemComponent = ({
    item,
    language,
    isDarkMode,
    currencySymbol,
    exchangeRate = 1,
    onUpdateQuantity,
    onRemoveItem,
    onToggleAccountType,
}: CartItemProps) => {
    const [imageError, setImageError] = useState(false);
    const t = translations[language];
    const cart = t.cart;
    
    const imageSrc = imageError || !item.game.image 
        ? getGamePlaceholder(item.game.title, isDarkMode)
        : item.game.image;
    
    return (
        <div className={styles.cartItem}>
            <img
                src={imageSrc}
                alt={item.game.title}
                className={styles.gameImage}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
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
                        {formatPrice(item.game, currencySymbol, exchangeRate)}
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
    );
};

// Вспомогательная функция для форматирования цены
const formatPrice = (game: { price?: string; priceValue?: number }, currencySymbol: string, exchangeRate: number): string => {
    const getPrice = (game: { price?: string; priceValue?: number }): number => {
        if (game.priceValue !== undefined && game.priceValue !== null) {
            return game.priceValue;
        }
        if (!game.price) return 0;
        const digitsOnly = game.price.replace(/\D/g, '');
        const price = parseInt(digitsOnly, 10);
        return isNaN(price) ? 0 : price;
    };
    
    const priceInUah = getPrice(game);
    const convertedPrice = priceInUah * exchangeRate;
    
    // Format based on whether it's an integer or float
    // For integer-like results (e.g. UAH), usually no decimals if round.
    // For USD/EUR usually 2 decimals.
    // Let's use standard locale string with decimals if needed.
    
    return `${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
};

