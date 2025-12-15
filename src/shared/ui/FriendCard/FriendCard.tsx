import type { Friend } from '@shared/types';
import styles from './styles.module.css';

interface FriendCardProps {
    friend: Friend;
}

export const FriendCard = ({ friend }: FriendCardProps) => {
    return (
        <div className={styles.friendCard}>
            <img src={friend.avatar} alt={friend.name} className={styles.friendAvatar} />
            <p>{friend.name}</p>
        </div>
    );
};
