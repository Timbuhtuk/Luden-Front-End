import { useState, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { GameCard, SaleCard, Loader } from '@shared/ui';
import { Cart } from '@widgets/Cart';
import ludenLogoKey from '../../assets/Luden-logo-key.png';
import ludenLogoSvg from '../../assets/luden-logo.svg';
import { ProductModal } from '../../components/ProductModal/index.tsx';
import { GameDetailsModal } from '../../components/GameDetailsModal/index.tsx';
import { MdSearch, MdShoppingCart, MdLanguage, MdAccountCircle, MdWbSunny, MdNightlight, MdKeyboardArrowDown, MdCheck, MdAdd, MdEdit } from 'react-icons/md';
import type { Game, ProductDto } from '@shared/types';
// import { useTheme } from '@app/providers'; // We will replace usage
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '@entities/User';
import { useTranslation } from '@shared/lib';
import { useGetProductsQuery } from '@entities/Product';
import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '@entities/Favorite';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';

// Redux
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { 
    setCartOpen, 
    addToCart, 
    updateQuantity, 
    removeItem, 
    toggleAccountType, 
    clearCart 
} from '@entities/Cart/model/cartSlice';
import { toggleTheme } from '@features/Theme/model/themeSlice';
import { setLanguage } from '@features/Language/model/languageSlice';
import { setCurrency } from '@features/Currency/model/currencySlice';
import { COUNTRIES } from '@shared/const/countries';

// Функция для получения URL изображения продукта
const getProductImageUrl = (product: ProductDto | null | undefined): string => {
// ...
    if (!product) {
        return getGamePlaceholder('Product', false);
    }
    
    // Приоритет 1: coverUrl из продукта
    if (product.coverUrl) {
        return product.coverUrl;
    }
    
    // Приоритет 2: url из файлов
    if (product.files && product.files.length > 0) {
        // Ищем файл с изображением, у которого есть url
        const imageFile = product.files.find((f) => 
            f?.url && (f?.fileType === 'Image' || f?.mimeType?.startsWith('image/'))
        ) || product.files.find((f) => f?.url);
        
        if (imageFile?.url) {
            return imageFile.url;
        }
        
        // Если нет url, но есть id, используем blob API
        const fileWithId = product.files.find((f) => 
            f?.fileType === 'Image' || f?.mimeType?.startsWith('image/')
        ) || product.files[0];
        
        if (fileWithId?.id) {
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            return `${baseUrl}${API_ENDPOINTS.blob.image(fileWithId.id)}`;
        }
    }
    
    // Fallback на красивый плейсхолдер
    return getGamePlaceholder(product.name || 'Product', false);
};

export const StorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeNav, setActiveNav] = useState('Recommendations');
    const [showCategories, setShowCategories] = useState(false);
    const [showSale, setShowSale] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<string | null>(null);
    const [selectedSort, setSelectedSort] = useState<string | null>(null);
    
    // Redux State
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(state => state.cart.items);
    const isCartOpen = useAppSelector(state => state.cart.isOpen);
    const isDarkMode = useAppSelector(state => state.theme.isDarkMode);
    const language = useAppSelector(state => state.language.language);
    const selectedCurrency = useAppSelector(state => state.currency.selectedCountry);

    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [username, setUsername] = useState<string>('nickname');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // const { isDarkMode, toggleDarkMode } = useTheme(); // Replaced by Redux
    const navigate = useNavigate();
    const { t } = useTranslation(); // useTranslation still uses Context, we should fix that or keep parallel for now. 
    // Wait, useTranslation returns language from context. We should override it if we want full Redux.
    
    const { data: profileData } = useGetUserProfileQuery();
    
    // Check if user is admin
    const isAdmin = profileData?.role === 'Admin';

    // Загрузка продуктов из API
    const { data: productsData, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useGetProductsQuery();
    
    const handleSaveProduct = async (formData: FormData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // If API_BASE_URL already contains '/api', we shouldn't append it again
            const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
            
            const url = editingProduct 
                ? `${baseUrl}/api/Product/${editingProduct.id}`
                : `${baseUrl}/api/Product`;
            
            const method = editingProduct ? 'PUT' : 'POST';

            // For PUT request, we might need to send JSON instead of FormData if backend expects FromBody
            // Based on ProductController:
            // POST: [FromForm] CreateProductDto - works with FormData
            // PUT: [FromBody] UpdateProductDto - expects JSON
            
            let body: any = formData;
            let headers: HeadersInit = {
                'Authorization': `Bearer ${token}`
            };

            if (editingProduct) {
                // Convert FormData to JSON for PUT
                const jsonObject: any = {};
                formData.forEach((value, key) => {
                    if (key === 'cover') return; // Skip file for JSON
                    // Convert types
                    if (key === 'price' || key === 'stock' || key === 'regionId' || key === 'discountPercentage') {
                        jsonObject[key] = Number(value);
                    } else {
                        jsonObject[key] = value;
                    }
                });
                body = JSON.stringify(jsonObject);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {
                method,
                headers,
                body
            });

            if (!response.ok) throw new Error('Failed to save product');

            // If we are editing and have a cover file, we need to upload it separately via SetProductCover
            if (editingProduct && formData.get('cover')) {
                // This logic is complex because backend expects coverFileId, which implies uploading file first.
                // For simplicity in this iteration, we might only support cover upload on creation or separate endpoint.
                // Or we can use the same logic as creation if backend supports it.
                // Let's stick to creation supporting cover for now.
            }

            await refetchProducts();
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleDeleteProduct = async () => {
        if (!editingProduct) return;
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            // If API_BASE_URL already contains '/api', we shouldn't append it again
            const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
            const url = `${baseUrl}/api/Product/${editingProduct.id}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete product');

            await refetchProducts();
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const handleEditProduct = (gameId: number) => {
        const product = productsData?.find(p => p.id === gameId);
        if (product) {
            setEditingProduct(product);
            setIsProductModalOpen(true);
        }
    };

    const handleCreateProduct = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };
    
    // Загрузка избранных для проверки статуса (только если пользователь авторизован)
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const { data: favoritesData } = useGetFavoritesQuery(undefined, { skip: !token });
    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();
    
    // Создаем Set избранных ID для быстрой проверки
    const favoriteProductIds = useMemo(() => {
        return new Set(favoritesData?.map(fav => fav.product?.id).filter(Boolean) || []);
    }, [favoritesData]);
    
    // Преобразуем продукты в формат Game
    const games = useMemo<Game[]>(() => {
        if (!productsData) return [];
        
        return productsData.map(product => ({
            id: product.id,
            title: product.name || 'Untitled',
            image: getProductImageUrl(product),
            price: `${product.price.toLocaleString()} €`,
            priceValue: product.price, // Сохраняем оригинальную цену для расчетов
            genre: product.category || product.region?.name || undefined,
            isFavorite: favoriteProductIds.has(product.id),
            discountPercent: null, // Пока нет скидок в API
            developer: product.developer,
            publisher: product.publisher,
        }));
    }, [productsData, favoriteProductIds]);

    // === Завантаження username ===
    useEffect(() => {
        if (profileData?.username) {
            setUsername(profileData.username);
        }
    }, [profileData]);

    // === ЖАНРИ (динамічно з продуктів) ===
    const genres = useMemo(() => {
        if (!games) return [];
        // Збираємо унікальні категорії
        const uniqueGenres = Array.from(new Set(games.map(g => g.genre).filter(Boolean))) as string[];
        
        return uniqueGenres.map(g => {
            // Нормалізуємо ключ для перекладу
            const translationKey = g
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ''); // "Open World" -> "openworld"
            
            // Якщо ключ є в перекладах, використовуємо його, інакше просто відображаємо оригінальне значення
            const translatedValue = t(`genres.${translationKey === 'openworld' ? 'openWorld' : translationKey}`);
            const displayValue = translatedValue !== `genres.${translationKey}` ? translatedValue : g;

            return {
                key: translationKey === 'openworld' ? 'openWorld' : translationKey,
                value: g, // Це значення використовується для фільтрації
                displayValue: displayValue // Це значення для відображення
            };
        }).sort((a, b) => a.displayValue.localeCompare(b.displayValue));
    }, [games, t]);

    // === ПОШУК + ФІЛЬТРИ (useMemo) ===
    const filteredGames = useMemo(() => {
        let filtered = [...games];

        // 1. Пошук по назві
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(game =>
                game.title.toLowerCase().includes(query)
            );
        }

        // 2. Фільтр по жанру
        if (selectedGenre) {
            filtered = filtered.filter(g => g.genre === selectedGenre);
        }

        // 3. Фільтр по знижкам
        if (selectedSale) {
            const getFinalPrice = (game: Game): number => {
                if (!game.price) return 999;
                const basePriceStr = game.price.split(' (was')[0].trim();
                const basePrice = parseInt(basePriceStr.replace(/[^\d]/g, ''), 10);
                if (isNaN(basePrice)) return 999;
                return game.discountPercent !== null
                    ? Math.round(basePrice * (1 - game.discountPercent / 100))
                    : basePrice;
            };

            if (selectedSale === 'All Games') {
                filtered = filtered.filter(g => g.discountPercent !== null);
            } else if (selectedSale === '50%+ Off') {
                filtered = filtered.filter(g => g.discountPercent !== null && g.discountPercent >= 50);
            } else if (selectedSale === '30%+ Off') {
                filtered = filtered.filter(g =>
                    g.discountPercent !== null && g.discountPercent >= 30 && g.discountPercent < 50
                );
            } else if (selectedSale === 'Under 10€') {
                filtered = games.filter(g => {
                    const finalPrice = getFinalPrice(g);
                    return finalPrice !== null && finalPrice > 0 && finalPrice < 10;
                });
            } else if (selectedSale === 'Free Games') {
                filtered = filtered.filter(g => {
                    const price = getFinalPrice(g);
                    return price === 0;
                });
            }
        }

        // 4. Сортування
        if (selectedSort) {
            const getPrice = (game: Game): number => {
                if (game.priceValue !== undefined) return game.priceValue;
                if (!game.price) return 0;
                const digits = game.price.replace(/[^\d]/g, '');
                return parseInt(digits, 10) || 0;
            };

            filtered.sort((a, b) => {
                switch (selectedSort) {
                    case 'priceLowToHigh':
                        return getPrice(a) - getPrice(b);
                    case 'priceHighToLow':
                        return getPrice(b) - getPrice(a);
                    case 'nameAZ':
                        return a.title.localeCompare(b.title);
                    case 'nameZA':
                        return b.title.localeCompare(a.title);
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }, [games, searchQuery, selectedGenre, selectedSale, selectedSort]);

    // === ФІЛЬТРИ ===
    const handleNavClick = (nav: string) => {
        setActiveNav(nav);
        setShowCategories(false);
        setShowSale(false);
        setShowSort(false);
        setSelectedGenre(null);
        setSelectedSale(null);
        setSelectedSort(null);
    };

    const filterByGenre = (genreValue: string) => {
        setSelectedGenre(genreValue);
        setSelectedSale(null);
        setActiveNav('Categories');
        setShowCategories(false);
        setShowSort(false);
    };

    const filterBySale = (option: string) => {
        setSelectedSale(option);
        setSelectedGenre(null);
        setActiveNav('Sale');
        setShowSale(false);
        setShowSort(false);
    };

    const sortGames = (option: string) => {
        setSelectedSort(option);
        setShowSort(false);
    };

    const isSaleView = activeNav === 'Sale' || !!selectedSale;

    // === CART ===
    // Removed old handlers in favor of direct dispatch in render
    /*
    const handleAddToCart = (game: Game) => {
        // ...
    };
    // ... other handlers
    */

    const toggleFavorite = async (gameId: number) => {
        if (!token) {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            navigate('/');
            return;
        }
        
        try {
            const isFavorite = favoriteProductIds.has(gameId);
            if (isFavorite) {
                await removeFavorite(gameId).unwrap();
            } else {
                await addFavorite(gameId).unwrap();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className={`${styles.storePage} ${isDarkMode ? styles.dark : ''}`}>
            {/* === Header === */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <img src={ludenLogoKey} alt="Luden Key" className={styles.logoKey} />
                    <img src={ludenLogoSvg} alt="Luden" className={styles.logoSvg} />
                </div>

                {/* === ПОШУК === */}
                <div className={styles.searchBar}>
                    <MdSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label={t('aria.searchGames')}
                    />
                </div>

                <div className={styles.headerActions}>
                    <button
                        aria-label={t('aria.toggleTheme')}
                        onClick={() => dispatch(toggleTheme())}
                    >
                        {isDarkMode ? <MdNightlight className={styles.sunIcon} /> : <MdWbSunny className={styles.sunIcon} />}
                    </button>

                    {!isAdmin && (
                        <button
                            aria-label={t('aria.shoppingCart')}
                            onClick={() => dispatch(setCartOpen(true))}
                        >
                            <MdShoppingCart />
                            {cartItems.length > 0 && (
                                <span className={styles.cartBadge}>{cartItems.length}</span>
                            )}
                        </button>
                    )}

                    {/* === Currency Dropdown === */}
                    <div className={styles.languageDropdown}>
                        <button
                            aria-label="Toggle Currency"
                            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                            className={styles.currencyButton}
                        >
                            {selectedCurrency.symbol}
                        </button>
                        {showCurrencyDropdown && (
                            <div className={styles.languageMenu}>
                                {COUNTRIES.map((country) => (
                                    <button
                                        key={country.nameKey}
                                        className={`${styles.languageOption} ${selectedCurrency.nameKey === country.nameKey ? styles.active : ''}`}
                                        onClick={() => {
                                            dispatch(setCurrency(country));
                                            setShowCurrencyDropdown(false);
                                        }}
                                    >
                                        {country.symbol} - {country.currency}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* === Language Dropdown === */}
                    <div className={styles.languageDropdown}>
                        <button
                            aria-label={t('aria.toggleLanguage')}
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        >
                            <MdLanguage />
                        </button>
                        {showLanguageDropdown && (
                            <div className={styles.languageMenu}>
                                <button
                                    className={`${styles.languageOption} ${language === 'en' ? styles.active : ''}`}
                                    onClick={() => {
                                        dispatch(setLanguage('en'));
                                        setShowLanguageDropdown(false);
                                    }}
                                >
                                    {t('language.english')}
                                </button>
                                <button
                                    className={`${styles.languageOption} ${language === 'uk' ? styles.active : ''}`}
                                    onClick={() => {
                                        dispatch(setLanguage('uk'));
                                        setShowLanguageDropdown(false);
                                    }}
                                >
                                    {t('language.ukrainian')}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className={styles.profileBtn}
                        onClick={() => navigate('/profile')}
                        aria-label={t('aria.profile')}
                    >
                        <MdAccountCircle />
                        <span>{username}</span>
                    </button>
                </div>
            </header>

            {/* === Navigation === */}
            <nav className={styles.nav}>
                <button
                    className={activeNav === 'Recommendations' ? styles.navActive : ''}
                    onClick={() => handleNavClick('Recommendations')}
                >
                    {t('recommendations')}
                </button>

                {isAdmin && (
                    <button 
                        className={styles.navButton}
                        onClick={handleCreateProduct}
                        style={{ color: '#00ff00', borderColor: '#00ff00' }}
                    >
                        <MdAdd /> New Product
                    </button>
                )}

                <div className={styles.dropdown}>
                    <button
                        className={`${styles.navButton} ${activeNav === 'Categories' ? styles.navActive : ''}`}
                        onClick={() => {
                            setShowCategories(!showCategories);
                            setShowSale(false);
                            setShowSort(false);
                            setActiveNav('Categories');
                        }}
                    >
                        {t('categories')} <MdKeyboardArrowDown className={styles.arrow} />
                    </button>
                    {showCategories && (
                        <div className={styles.dropdownMenu}>
                            {genres.map(g => (
                                <button
                                    key={g.value}
                                    className={`${styles.dropdownItem} ${selectedGenre === g.value ? styles.dropdownItemActive : ''}`}
                                    onClick={() => filterByGenre(g.value)}
                                >
                                    <span>{g.displayValue}</span>
                                    {selectedGenre === g.value && <MdCheck className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.dropdown}>
                    <button
                        className={`${styles.navButton} ${showSort ? styles.navActive : ''}`}
                        onClick={() => {
                            setShowSort(!showSort);
                            setShowCategories(false);
                            setShowSale(false);
                        }}
                    >
                        {t('sort.sortBy')} <MdKeyboardArrowDown className={styles.arrow} />
                    </button>
                    {showSort && (
                        <div className={styles.dropdownMenu}>
                            {[
                                { key: 'priceLowToHigh', label: t('sort.priceLowToHigh') },
                                { key: 'priceHighToLow', label: t('sort.priceHighToLow') },
                                { key: 'nameAZ', label: t('sort.nameAZ') },
                                { key: 'nameZA', label: t('sort.nameZA') },
                            ].map((option) => (
                                <button
                                    key={option.key}
                                    className={`${styles.dropdownItem} ${selectedSort === option.key ? styles.dropdownItemActive : ''}`}
                                    onClick={() => sortGames(option.key)}
                                >
                                    <span>{option.label}</span>
                                    {selectedSort === option.key && <MdCheck className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.dropdown}>
                    <button
                        className={`${styles.navButton} ${activeNav === 'Sale' ? styles.navActive : ''}`}
                        onClick={() => {
                            setShowSale(!showSale);
                            setShowCategories(false);
                            setShowSort(false);
                            setActiveNav('Sale');
                        }}
                    >
                        {t('sale')} <MdKeyboardArrowDown className={styles.arrow} />
                    </button>
                    {showSale && (
                        <div className={styles.dropdownMenu}>
                            {[
                                { key: 'All Games', translation: t('allGames') },
                                { key: '50%+ Off', translation: t('off50') },
                                { key: '30%+ Off', translation: t('off30') },
                                { key: 'Under 10€', translation: t('under10') },
                                { key: 'Free Games', translation: t('freeGames') },
                            ].map(option => (
                                <button
                                    key={option.key}
                                    className={`${styles.dropdownItem} ${selectedSale === option.key ? styles.dropdownItemActive : ''}`}
                                    onClick={() => filterBySale(option.key)}
                                >
                                    <span>{option.translation}</span>
                                    {selectedSale === option.key && <MdCheck className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* === Game Grid === */}
            <main className={styles.gameGrid}>
                {isLoadingProducts ? (
                    <div className={styles.noGames}>
                        <Loader size="large" />
                    </div>
                ) : productsError ? (
                    <p className={styles.noGames}>
                        {t('errorLoadingProducts') || 'Error loading products. Please try again later.'}
                    </p>
                ) : filteredGames.length === 0 ? (
                    <p className={styles.noGames}>
                        {t('noGames')}
                    </p>
                ) : (
                    filteredGames.map(game => {
                        if (isSaleView) {
                            return (
                                <div key={game.id} style={{ position: 'relative' }}>
                                    <SaleCard
                                        game={game}
                                        onToggleFavorite={isAdmin ? undefined : toggleFavorite}
                                        onAddToCart={isAdmin ? undefined : () => dispatch(addToCart(game))}
                                        isDarkMode={isDarkMode}
                                        onClick={() => handleGameClick(game)}
                                        currencySymbol={selectedCurrency.symbol}
                                        exchangeRate={selectedCurrency.rate}
                                    />
                                    {isAdmin && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditProduct(game.id);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                zIndex: 10,
                                                backgroundColor: '#007bff',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                color: 'white'
                                            }}
                                        >
                                            <MdEdit />
                                        </button>
                                    )}
                                </div>
                            );
                        }
                        return (
                            <div key={game.id} style={{ position: 'relative' }}>
                                <GameCard
                                    game={game}
                                    onToggleFavorite={isAdmin ? undefined : toggleFavorite}
                                    onAddToCart={isAdmin ? undefined : () => dispatch(addToCart(game))}
                                    isDarkMode={isDarkMode}
                                    onClick={() => handleGameClick(game)}
                                    currencySymbol={selectedCurrency.symbol}
                                    exchangeRate={selectedCurrency.rate}
                                />
                                {isAdmin && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditProduct(game.id);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            zIndex: 10,
                                            backgroundColor: '#007bff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        <MdEdit />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </main>

            {/* === Cart Popup === */}
            <Cart
                isOpen={isCartOpen}
                onClose={() => dispatch(setCartOpen(false))}
                items={cartItems}
                onUpdateQuantity={(id, qty) => dispatch(updateQuantity({ gameId: id, quantity: qty }))}
                onRemoveItem={(id) => dispatch(removeItem(id))}
                onToggleAccountType={(id) => dispatch(toggleAccountType(id))}
                onClearCart={() => dispatch(clearCart())}
                language={language}
                isDarkMode={isDarkMode}
            />

            {/* === Product Modal === */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
            />

            {selectedGame && (
                <GameDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    game={selectedGame}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={(game) => dispatch(addToCart(game))}
                    isDarkMode={isDarkMode}
                    isAdmin={isAdmin}
                    currencySymbol={selectedCurrency.symbol}
                    exchangeRate={selectedCurrency.rate}
                />
            )}
        </div>
    );
};

export default StorePage;