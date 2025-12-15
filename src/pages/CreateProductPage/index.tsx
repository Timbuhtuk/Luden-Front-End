import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdPhotoCamera, MdClose } from 'react-icons/md';
import ProductService from '../../services/ProductService';
import { useProducts } from '../../context/ProductContext';
import styles from './styles.module.css';
import { useTheme } from '../../context/ThemeContext';

export const CreateProductPage = () => {
    const { isDarkMode } = useTheme();
    const { refreshProducts } = useProducts();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [regionId, setRegionId] = useState('1');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));

            setImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // Освобождаем память от URL.createObjectURL
            URL.revokeObjectURL(prev[index]);
            return newPreviews;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !price || !stock) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            // Шаг 1: Создаем продукт
            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                regionId: parseInt(regionId),
            };

            const newProduct = await ProductService.createProduct(productData);

            if (!newProduct) {
                throw new Error('Failed to create product');
            }

            // Шаг 2: Загружаем изображения если есть
            if (images.length > 0) {
                await ProductService.uploadProductFilesBulk(newProduct.id, images, 'screenshot');
            }

            // Обновляем список продуктов
            await refreshProducts();

            alert('Product created successfully!');
            navigate('/store');
        } catch (error: any) {
            alert('Error: ' + (error.message || 'Failed to create product'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.createProductPage} ${isDarkMode ? styles.dark : ''}`}>
            <header className={styles.header}>
                <button onClick={() => navigate('/store')} className={styles.backButton}>
                    <MdArrowBack />
                    <span>Back to Store</span>
                </button>
                <h1>Create New Product</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Product Name *</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter product name"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter product description"
                        rows={4}
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="price">Price (€) *</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="stock">Stock *</label>
                        <input
                            id="stock"
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="regionId">Region</label>
                    <select
                        id="regionId"
                        value={regionId}
                        onChange={(e) => setRegionId(e.target.value)}
                    >
                        <option value="1">Global</option>
                        <option value="2">Europe</option>
                        <option value="3">North America</option>
                        <option value="4">Asia</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Product Images</label>
                    <div className={styles.imageSection}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />

                        <div className={styles.imagePreviews}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className={styles.imagePreview}>
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className={styles.removeImage}
                                    >
                                        <MdClose />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={styles.addImageButton}
                            >
                                <MdPhotoCamera />
                                <span>Add Images</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => navigate('/store')}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductPage;
