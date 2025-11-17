
import type { Game } from '@shared/types';
import styles from './styles.module.css';
import { MdStar } from 'react-icons/md';
import { useTheme } from '@app/providers';
import { useTranslation } from '@shared/lib';

interface FavoriteGameCardProps {
    game: Game;
    onToggleFavorite: (gameId: number) => void;
}

export const FavoriteGameCard = ({ game, onToggleFavorite }: FavoriteGameCardProps) => {
    const { isDarkMode } = useTheme();
    const { t } = useTranslation();

    const translatedGenre = game.genre ? t(`genres.${game.genre.toLowerCase()}`) : '';

    return (
        <div className={`${styles.favoriteCard} ${isDarkMode ? styles.dark : ''}`}>
            <img src={game.image} alt={game.title} className={styles.gameImage} />

            <button
                className={styles.starButton}
                onClick={() => onToggleFavorite(game.id)}
                aria-label={t('aria.removeFromFavorites')}
            >
                <MdStar className={styles.starIcon} />
            </button>

            <div className={styles.gameInfo}>
                <p className={styles.gameTitle}>{game.title}</p>
                {game.price && <p className={styles.gamePrice}>{game.price}</p>}
                {game.genre && <p className={styles.gameGenre}>{translatedGenre}</p>}
            </div>
        </div>
    );
};