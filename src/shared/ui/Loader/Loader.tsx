import styles from './Loader.module.css';

interface LoaderProps {
    fullScreen?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const Loader = ({ fullScreen = false, size = 'medium', className = '' }: LoaderProps) => {
    return (
        <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''} ${className}`}>
            <div className={`${styles.loader} ${styles[size]}`}>
                <div className={styles.inner}></div>
                <div className={styles.inner}></div>
                <div className={styles.inner}></div>
            </div>
        </div>
    );
};

