import type { ProductDto } from '@shared/types';
import styles from './styles.module.css';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { useState } from 'react';

interface ProductCardProps {
    product: ProductDto;
    onClick?: () => void;
    isDarkMode?: boolean;
}

export const ProductCard = ({ product, onClick, isDarkMode = false }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    
    const getCoverImage = () => {
        if (imageError) {
            return getGamePlaceholder(product.name || 'Product', false);
        }
        
        console.log('Product data:', {
            name: product.name,
            coverUrl: product.coverUrl,
            filesCount: product.files?.length || 0,
            files: product.files
        });
        
        if (product.coverUrl) {
            console.log('Using coverUrl:', product.coverUrl);
            return product.coverUrl;
        }

        if (product.files && product.files.length > 0) {
            const coverFile = product.files
                .filter(f => (f.fileType === 'screenshot' || f.fileType === 'cover') && f.url)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];

            if (coverFile?.url) {
                return coverFile.url;
            }

            const fileWithUrl = product.files.find(f => f.url);
            if (fileWithUrl?.url) {
                return fileWithUrl.url;
            }

            const imageFile = product.files.find((f) => 
                f?.fileType === 'Image' || f?.mimeType?.startsWith('image/')
            ) || product.files.find((f) => 
                f?.fileType === 'screenshot' || f?.fileType === 'cover'
            ) || product.files[0];

            if (imageFile?.id) {
                const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                return `${baseUrl}${API_ENDPOINTS.blob.image(imageFile.id)}`;
            }

            const coverFileWithPath = product.files
                .filter(f => f.fileType === 'screenshot' || f.fileType === 'cover')
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];

            if (coverFileWithPath?.path) {
                return `/uploads/${coverFileWithPath.path.replace(/\\/g, '/')}`;
            }

            const imageFileWithPath = product.files.find(f => f.mimeType?.startsWith('image/'));
            if (imageFileWithPath?.path) {
                return `/uploads/${imageFileWithPath.path.replace(/\\/g, '/')}`;
            }
        }

        return getGamePlaceholder(product.name || 'Product', false);
    };

    const priceDisplay = product.price ? `${product.price.toLocaleString()} ₴` : '—';

    return (
        <div className={`${styles.gameCard} ${isDarkMode ? styles.dark : ''}`} onClick={onClick}>
            <div className={styles.gameImageWrapper}>
                <img
                    src={getCoverImage()}
                    alt={product.name || 'Product'}
                    className={styles.gameImage}
                    onError={() => {
                        setImageError(true);
                    }}
                    onLoad={() => {
                        setImageError(false);
                    }}
                />

                <div className={styles.infoPanel}>
                    <span className={styles.price}>{priceDisplay}</span>
                    {product.category && <span className={styles.genre}>{product.category}</span>}
                </div>
            </div>

            <p className={styles.gameTitle}>{product.name}</p>
        </div>
    );
};
