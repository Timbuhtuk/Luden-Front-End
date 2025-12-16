import type { Game } from '@shared/types';
import styles from './styles.module.css';
import { MdStar, MdStarBorder, MdShoppingCart } from 'react-icons/md';
import { useTranslation } from '@shared/lib';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';
import { useState } from 'react';

interface GameCardProps {
    game: Game;
    onToggleFavorite?: (gameId: number) => void;
    onAddToCart?: (game: Game) => void;
    isDarkMode?: boolean;
    noHover?: boolean;
    onClick?: () => void;
    currencySymbol?: string;
    exchangeRate?: number;
}

export const GameCard = ({ 
    game, 
    onToggleFavorite, 
    onAddToCart, 
    isDarkMode = false, 
    noHover = false, 
    onClick,
    currencySymbol = '€',
    exchangeRate = 1
}: GameCardProps) => {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);
    
    const getImageSrc = () => {
        if (imageError || !game.image) {
            return getGamePlaceholder(game.title, isDarkMode);
        }
        return game.image;
    };

    const discountPercent = game.discountPercent;
    // Get price from priceValue if available, otherwise parse string
    const originalPrice = game.priceValue ?? (game.price ? parseInt(game.price.replace(/[^\d]/g, ''), 10) : null);

    const currentPrice = discountPercent !== null && originalPrice !== null
        ? Math.round(originalPrice * (1 - discountPercent / 100))
        : originalPrice;

    // Apply exchange rate
    const finalPrice = currentPrice !== null 
        ? currentPrice * exchangeRate 
        : null;

    const displayPrice = finalPrice !== null
        ? `${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`
        : '—';

    return (
        <div 
            className={`${styles.gameCard} ${isDarkMode ? styles.dark : ''} ${noHover ? styles.noHover : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className={styles.gameImageWrapper}>
                <img 
                    src={getImageSrc()} 
                    alt={game.title} 
                    className={styles.gameImage}
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                />

                {onToggleFavorite && (
                    <button
                        className={styles.favoriteButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game.id);
                        }}
                        aria-label={game.isFavorite ? t('aria.removeFromFavorites') : t('aria.addToFavorites')}
                    >
                        {game.isFavorite ? (
                            <MdStar className={styles.favoriteIconFilled} />
                        ) : (
                            <MdStarBorder className={styles.favoriteIcon} />
                        )}
                    </button>
                )}

                <div className={styles.infoPanel}>
                    <span className={styles.price}>{displayPrice}</span>
                </div>

                {onAddToCart && (
                    <button
                        className={styles.addToCartButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(game);
                        }}
                        aria-label={t('aria.addToCart')}
                    >
                        <MdShoppingCart />
                    </button>
                )}
            </div>

            <p className={styles.gameTitle}>{game.title}</p>
        </div>
    );
};

