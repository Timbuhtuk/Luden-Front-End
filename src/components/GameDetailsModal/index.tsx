import { MdClose, MdShoppingCart, MdStar, MdStarBorder } from 'react-icons/md';
import styles from './styles.module.css';
import type { Game } from '@shared/types';
import { useTranslation } from '@shared/lib';

interface GameDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    game: Game;
    onToggleFavorite?: (gameId: number) => void;
    onAddToCart?: (game: Game) => void;
    isDarkMode?: boolean;
    isAdmin?: boolean;
    currencySymbol?: string;
    exchangeRate?: number;
}

export const GameDetailsModal = ({
    isOpen,
    onClose,
    game,
    onToggleFavorite,
    onAddToCart,
    isDarkMode,
    isAdmin,
    currencySymbol = '€',
    exchangeRate = 1
}: GameDetailsModalProps) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

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
        
    // Normalization logic for translation
    const getGenreKey = (genre: string): string => {
        const normalized = genre
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '');
        return normalized === 'openworld' ? 'openWorld' : normalized;
    };

    const translatedGenre = game.genre ? t(`genres.${getGenreKey(game.genre)}`) : '';
    // If translation is missing or equals key, use original genre
    const displayGenre = (translatedGenre && translatedGenre !== `genres.${getGenreKey(game.genre || '')}`) 
        ? translatedGenre 
        : game.genre;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={`${styles.modal} ${isDarkMode ? styles.dark : ''}`} 
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose}>
                    <MdClose />
                </button>

                <div className={styles.content}>
                    <div className={styles.imageContainer}>
                        <img src={game.image} alt={game.title} className={styles.gameImage} />
                    </div>
                    
                    <div className={styles.details}>
                        <h2 className={styles.title}>{game.title}</h2>
                        
                        {displayGenre && (
                            <div className={styles.tag}>
                                {displayGenre}
                            </div>
                        )}
                        
                        {(game.developer || game.publisher) && (
                            <div className={styles.infoRow}>
                                {game.developer && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>{t('gameDetails.developer') || 'Developer'}:</span>
                                        <span className={styles.value}>{game.developer}</span>
                                    </div>
                                )}
                                {game.publisher && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>{t('gameDetails.publisher') || 'Publisher'}:</span>
                                        <span className={styles.value}>{game.publisher}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>{displayPrice}</span>
                            {discountPercent !== null && (
                                <span className={styles.discount}>-{discountPercent}%</span>
                            )}
                        </div>

                        <div className={styles.actions}>
                            {!isAdmin && onAddToCart && (
                                <button
                                    className={styles.cartBtn}
                                    onClick={() => onAddToCart(game)}
                                >
                                    <MdShoppingCart /> {t('aria.addToCart')}
                                </button>
                            )}

                            {!isAdmin && onToggleFavorite && (
                                <button
                                    className={`${styles.favoriteBtn} ${game.isFavorite ? styles.favoriteActive : ''}`}
                                    onClick={() => onToggleFavorite(game.id)}
                                >
                                    {game.isFavorite ? <MdStar /> : <MdStarBorder />}
                                    {game.isFavorite ? t('aria.removeFromFavorites') : t('aria.addToFavorites')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

