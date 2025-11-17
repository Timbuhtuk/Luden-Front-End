import type { Game } from '@shared/types';
import styles from './styles.module.css';
import { MdStar, MdStarBorder, MdShoppingCart } from 'react-icons/md';

interface SaleCardProps {
    game: Game;
    onToggleFavorite?: (gameId: number) => void;
    onAddToCart?: (game: Game) => void;
    isDarkMode?: boolean;
}

export const SaleCard = ({
                             game,
                             onToggleFavorite,
                             onAddToCart,
                             isDarkMode = false
                         }: SaleCardProps) => {
    const discountPercent = game.discountPercent;

    const priceStr = game.price ?? '';
    const originalPriceStr = priceStr.split(' (was')[0].replace(/[^\d]/g, '');
    const originalPrice = originalPriceStr ? parseInt(originalPriceStr, 10) : 0;

    if (!priceStr) {
        return (
            <div className={`${styles.saleCard} ${isDarkMode ? styles.dark : ''}`}>
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

    return (
        <div className={`${styles.saleCard} ${isDarkMode ? styles.dark : ''}`}>
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
                                {originalPrice.toLocaleString()} €
                            </span>
                            <span className={styles.newPrice}>
                                {currentPrice.toLocaleString()} €
                            </span>
                        </>
                    ) : (
                        <span className={styles.newPrice} style={{ marginLeft: 'auto' }}>
                            {originalPrice.toLocaleString()} €
                        </span>
                    )}
                </div>
            </div>

            <p className={styles.gameTitle}>{game.title}</p>
        </div>
    );
};