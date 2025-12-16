import { MdClose, MdContentCopy } from 'react-icons/md';
import type { ProductDto } from '@shared/types';
import styles from './styles.module.css';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { useState } from 'react';

interface LibraryProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductDto;
    isDarkMode?: boolean;
}

export const LibraryProductModal = ({ isOpen, onClose, product, isDarkMode = false }: LibraryProductModalProps) => {
    const [imageError, setImageError] = useState(false);
    
    if (!isOpen) return null;

    const getCoverImage = () => {
        if (imageError) {
            return getGamePlaceholder(product.name || 'Product', false);
        }
        
        if (product.coverUrl) {
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={`${styles.modalOverlay} ${isDarkMode ? styles.dark : ''}`} onClick={onClose}>
            <div className={`${styles.modalContent} ${isDarkMode ? styles.dark : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <MdClose />
                </button>

                <div className={styles.modalBody}>
                    <div className={styles.imageSection}>
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
                    </div>

                    <div className={styles.infoSection}>
                        <h2 className={styles.productName}>{product.name}</h2>
                        
                        {product.description && (
                            <p className={styles.description}>{product.description}</p>
                        )}

                        {product.licenses && product.licenses.length > 0 && (
                            <div className={styles.licensesSection}>
                                <h3 className={styles.sectionTitle}>License Keys</h3>
                                {product.licenses.map((license) => (
                                    <div key={license.id} className={styles.licenseCard}>
                                        <div className={styles.licenseHeader}>
                                            <span className={styles.licenseStatus}>{license.status}</span>
                                        </div>
                                        <div className={styles.licenseKeyContainer}>
                                            <code className={styles.licenseKey}>{license.licenseKey}</code>
                                            <button
                                                className={styles.copyButton}
                                                onClick={() => copyToClipboard(license.licenseKey || '')}
                                                title="Copy to clipboard"
                                            >
                                                <MdContentCopy />
                                            </button>
                                        </div>
                                        {license.expiresAt && (
                                            <div className={styles.expiryInfo}>
                                                Expires: {new Date(license.expiresAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.metadata}>
                            {product.developer && (
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Developer:</span>
                                    <span className={styles.metadataValue}>{product.developer}</span>
                                </div>
                            )}
                            {product.publisher && (
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Publisher:</span>
                                    <span className={styles.metadataValue}>{product.publisher}</span>
                                </div>
                            )}
                            {product.releaseDate && (
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Release Date:</span>
                                    <span className={styles.metadataValue}>
                                        {new Date(product.releaseDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
