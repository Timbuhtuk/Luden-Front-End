import type { Game } from '@shared/types';
import styles from './styles.module.css';
import { MdStar, MdStarBorder, MdShoppingCart } from 'react-icons/md';

interface SaleCardProps {
    game: Game;
    onToggleFavorite?: (gameId: number) => void;
    onAddToCart?: (game: Game) => void;
    isDarkMode?: boolean;
    onClick?: () => void;
    currencySymbol?: string;
    exchangeRate?: number;
}

export const SaleCard = ({
                             game,
                             onToggleFavorite,
                             onAddToCart,
                             isDarkMode = false,
                             onClick,
                             currencySymbol = '€',
                             exchangeRate = 1
                         }: SaleCardProps) => {
    const discountPercent = game.discountPercent;

    // Get price from priceValue if available, otherwise parse string
    const originalPrice = game.priceValue ?? (game.price ? parseInt(game.price.replace(/[^\d]/g, ''), 10) : 0);

    if (originalPrice === 0 && !game.price) {
        return (
            <div 
                className={`${styles.saleCard} ${isDarkMode ? styles.dark : ''}`}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
                <div className={styles.gameImageWrapper}>
                    <img src={game.image} alt={game.title} className={styles.gameImage} />
                    <div className={styles.saleInfoPanel}>
                        <span className={styles.newPrice}>—</span>
                    </div>
                </div>
                <p className={styles.gameTitle}>{game.title}</p>
            </div>
        );
    }

    const currentPrice = discountPercent !== null
        ? Math.round(originalPrice * (1 - discountPercent / 100))
        : originalPrice;

    // Apply exchange rate
    const finalOriginalPrice = originalPrice * exchangeRate;
    const finalCurrentPrice = currentPrice * exchangeRate;

    return (
        <div 
            className={`${styles.saleCard} ${isDarkMode ? styles.dark : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className={styles.gameImageWrapper}>
                <img src={game.image} alt={game.title} className={styles.gameImage} />

                {/* Кнопка избранного */}
                {onToggleFavorite && (
                    <button
                        className={styles.favoriteButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game.id);
                        }}
                    >
                        {game.isFavorite ? (
                            <MdStar className={styles.favoriteIconFilled} />
                        ) : (
                            <MdStarBorder className={styles.favoriteIcon} />
                        )}
                    </button>
                )}

                {/* Бейдж скидки */}
                {discountPercent !== null && (
                    <div className={styles.discountBadge}>
                        -{discountPercent}%
                    </div>
                )}

                {/* Кнопка добавления в корзину */}
                {onAddToCart && (
                    <button
                        className={styles.addToCartButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(game);
                        }}
                        aria-label="Add to cart"
                    >
                        <MdShoppingCart />
                    </button>
                )}

                {/* Панель с ценой */}
                <div className={styles.saleInfoPanel}>
                    {discountPercent !== null ? (
                        <>
                            <span className={styles.oldPrice}>
                                {finalOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currencySymbol}
                            </span>
                            <span className={styles.newPrice}>
                                {finalCurrentPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currencySymbol}
                            </span>
                        </>
                    ) : (
                        <span className={styles.newPrice} style={{ marginLeft: 'auto' }}>
                            {finalOriginalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currencySymbol}
                        </span>
                    )}
                </div>
            </div>

            <p className={styles.gameTitle}>{game.title}</p>
        </div>
    );
};