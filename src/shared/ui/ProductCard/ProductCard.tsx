import type { ProductDto } from '@shared/types';
import styles from './styles.module.css';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';
import { useState } from 'react';

interface ProductCardProps {
    product: ProductDto;
    onClick?: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    
    // Получаем изображение обложки
    const getCoverImage = () => {
        if (imageError) {
            return getGamePlaceholder(product.name || 'Product', false);
        }
        // Приоритет 1: coverUrl из продукта
        if (product.coverUrl) {
            return product.coverUrl;
        }

        // Приоритет 2: url из файлов
        if (product.files && product.files.length > 0) {
            // Ищем файл с типом "screenshot" или "cover", у которого есть url
            const coverFile = product.files
                .filter(f => (f.fileType === 'screenshot' || f.fileType === 'cover') && f.url)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];

            if (coverFile?.url) {
                return coverFile.url;
            }

            // Ищем любой файл с url
            const fileWithUrl = product.files.find(f => f.url);
            if (fileWithUrl?.url) {
                return fileWithUrl.url;
            }

            // Приоритет 3: используем blob API через id файла
            const imageFile = product.files.find((f) => 
                f?.fileType === 'Image' || f?.mimeType?.startsWith('image/')
            ) || product.files.find((f) => 
                f?.fileType === 'screenshot' || f?.fileType === 'cover'
            ) || product.files[0];

            if (imageFile?.id) {
                const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                return `${baseUrl}${API_ENDPOINTS.blob.image(imageFile.id)}`;
            }

            // Приоритет 4: если нет id, но есть path, используем старый способ
            const coverFileWithPath = product.files
                .filter(f => f.fileType === 'screenshot' || f.fileType === 'cover')
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];

            if (coverFileWithPath?.path) {
                return `/uploads/${coverFileWithPath.path.replace(/\\/g, '/')}`;
            }

            // Если нет скриншота, берем первый файл изображения
            const imageFileWithPath = product.files.find(f => f.mimeType?.startsWith('image/'));
            if (imageFileWithPath?.path) {
                return `/uploads/${imageFileWithPath.path.replace(/\\/g, '/')}`;
            }
        }

        // Fallback: плейсхолдер только если ничего не найдено
        return getGamePlaceholder(product.name || 'Product', false);
    };

    return (
        <div className={styles.productCard} onClick={onClick}>
            <div className={styles.imageContainer}>
                <img
                    src={getCoverImage()}
                    alt={product.name || 'Product'}
                    className={styles.productImage}
                    onError={() => {
                        setImageError(true);
                    }}
                    onLoad={() => {
                        setImageError(false);
                    }}
                />
                <div className={styles.overlay}>
                    <span className={styles.playButton}>▶</span>
                </div>
            </div>
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
            </div>
        </div>
    );
};
