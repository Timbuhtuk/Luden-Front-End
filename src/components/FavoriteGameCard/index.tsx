import type { Game } from '../../models';
import styles from './styles.module.css';
import { MdStar } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';

interface FavoriteGameCardProps {
    game: Game;
    onToggleFavorite: (gameId: number) => void;
}

export const FavoriteGameCard = ({ game, onToggleFavorite }: FavoriteGameCardProps) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`${styles.favoriteCard} ${isDarkMode ? styles.dark : ''}`}>
            <img src={game.image} alt={game.title} className={styles.gameImage} />

            <button
                className={styles.starButton}
                onClick={() => onToggleFavorite(game.id)}
                aria-label="Remove from favorites"
            >
                <MdStar className={styles.starIcon} />
            </button>

            <div className={styles.gameInfo}>
                <p className={styles.gameTitle}>{game.title}</p>
                {game.price && <p className={styles.gamePrice}>{game.price}</p>}
                {game.genre && <p className={styles.gameGenre}>{game.genre}</p>}
            </div>
        </div>
    );
};