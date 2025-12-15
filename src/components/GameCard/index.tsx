import type { Game } from '../../models';
import styles from './styles.module.css';
import { MdStar, MdStarBorder, MdShoppingCart } from 'react-icons/md';
import { useTranslation } from '../../hooks/useTranslation';

interface GameCardProps {
    game: Game;
    onToggleFavorite?: (gameId: number) => void;
    onAddToCart?: (game: Game) => void;
    isDarkMode?: boolean;
}

export const GameCard = ({ game, onToggleFavorite, onAddToCart, isDarkMode = false }: GameCardProps) => {
    const { t } = useTranslation();

    const discountPercent = game.discountPercent;
    const priceStr = game.price ?? '';
    const originalPriceStr = priceStr.split(' (was')[0].replace(/[^\d]/g, '');
    const originalPrice = originalPriceStr ? parseInt(originalPriceStr, 10) : null;

    const currentPrice = discountPercent !== null && originalPrice !== null
        ? Math.round(originalPrice * (1 - discountPercent / 100))
        : originalPrice;

    const displayPrice = currentPrice !== null
        ? `${currentPrice.toLocaleString()} €`
        : '—';

    // ← ВИПРАВЛЕНО: Нормалізація ключа жанру
    const getGenreKey = (genre: string): string => {
        const normalized = genre
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ''); // "open world" → "openworld"
        return normalized === 'openworld' ? 'openWorld' : normalized;
    };

    const translatedGenre = game.genre ? t(`genres.${getGenreKey(game.genre)}`) : '';

    return (
        <div className={`${styles.gameCard} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.gameImageWrapper}>
                <img src={game.image} alt={game.title} className={styles.gameImage} />

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
                    {game.genre && <span className={styles.genre}>{translatedGenre}</span>}
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