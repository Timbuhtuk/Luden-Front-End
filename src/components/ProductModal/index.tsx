import { useState, useEffect } from 'react';
import { MdClose, MdUpload } from 'react-icons/md';
import styles from './styles.module.css';
import type { ProductDto } from '@shared/types';
import { useTranslation } from '@shared/lib';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: ProductDto | null;
    onSave: (formData: FormData) => Promise<void>;
    onDelete?: () => Promise<void>;
}

export const ProductModal = ({ isOpen, onClose, product, onSave, onDelete }: ProductModalProps) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [developer, setDeveloper] = useState('');
    const [publisher, setPublisher] = useState('');
    const [category, setCategory] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const availableCategories = [
        'Open World', 'RPG', 'Action', 'Shooter', 'Indie', 'Strategy', 'Horror', 'Racing',
        'Adventure', 'Simulation', 'Sports', 'Puzzle', 'Fighting', 'Arcade', 'Platformer',
        'MMO', 'FPS', 'Battle Royale'
    ];

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price.toString());
            setStock(product.stock.toString());
            setDiscountPercentage(product.discountPercentage?.toString() || '0');
            setDeveloper(product.developer || '');
            setPublisher(product.publisher || '');
            setCategory(product.category || '');
            setReleaseDate(product.releaseDate ? new Date(product.releaseDate).toISOString().split('T')[0] : '');
            setPreviewUrl(product.coverUrl || null);
        } else {
            // Reset form for create mode
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setDiscountPercentage('');
            setDeveloper('');
            setPublisher('');
            setCategory(availableCategories[0]);
            setReleaseDate('');
            setCoverFile(null);
            setPreviewUrl(null);
        }
    }, [product, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('stock', stock);
            formData.append('regionId', '1'); // Default to 1 for now
            if (discountPercentage) formData.append('discountPercentage', discountPercentage);
            if (developer) formData.append('developer', developer);
            if (publisher) formData.append('publisher', publisher);
            if (category) formData.append('category', category);
            if (releaseDate) formData.append('releaseDate', new Date(releaseDate).toISOString());
            if (coverFile) formData.append('cover', coverFile);

            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryKey = (cat: string) => {
        const key = cat.toLowerCase().trim().replace(/\s+/g, '');
        return key === 'openworld' ? 'openWorld' : key;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{product ? 'Edit Product' : 'Create Product'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.imageUpload}>
                        <div 
                            className={styles.imagePreview}
                            style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : 'none' }}
                        >
                            {!previewUrl && <MdUpload className={styles.uploadIcon} />}
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            rows={4}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Price</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Stock</label>
                            <input 
                                type="number" 
                                value={stock} 
                                onChange={e => setStock(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Discount %</label>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={discountPercentage} 
                                onChange={e => setDiscountPercentage(e.target.value)} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="">Select Category</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {t(`genres.${getCategoryKey(cat)}`) || cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Developer</label>
                            <input 
                                type="text" 
                                value={developer} 
                                onChange={e => setDeveloper(e.target.value)} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Publisher</label>
                            <input 
                                type="text" 
                                value={publisher} 
                                onChange={e => setPublisher(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Release Date</label>
                        <input 
                            type="date" 
                            value={releaseDate} 
                            onChange={e => setReleaseDate(e.target.value)} 
                        />
                    </div>

                    <div className={styles.actions}>
                        {product && onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className={styles.deleteBtn}
                                disabled={isLoading}
                            >
                                Delete
                            </button>
                        )}
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className={styles.saveBtn}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

