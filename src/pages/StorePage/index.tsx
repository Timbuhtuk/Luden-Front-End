import { useState, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { GameCard, SaleCard } from '@shared/ui';
import { Cart } from '@widgets/Cart';
import ludenLogoKey from '../../assets/Luden-logo-key.png';
import ludenLogoSvg from '../../assets/luden-logo.svg';
import {
    MdSearch,
    MdShoppingCart,
    MdLanguage,
    MdAccountCircle,
    MdWbSunny,
    MdNightlight,
    MdKeyboardArrowDown,
    MdCheck
} from 'react-icons/md';
import type { Game, CartItem, ProductDto } from '@shared/types';
import { useTheme } from '@app/providers';
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery } from '@entities/User';
import { useTranslation } from '@shared/lib';
import { useGetProductsQuery } from '@entities/Product';
import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '@entities/Favorite';
import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';
import { getGamePlaceholder } from '@shared/lib/image-placeholder';

// Функция для получения URL изображения продукта
const getProductImageUrl = (product: ProductDto | null | undefined): string => {
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
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [username, setUsername] = useState<string>('nickname');

    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useTranslation();
    const { data: profileData } = useGetUserProfileQuery();
    
    // Загрузка продуктов из API
    const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useGetProductsQuery();
    
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
            genre: product.region?.name || undefined,
            isFavorite: favoriteProductIds.has(product.id),
            discountPercent: null, // Пока нет скидок в API
        }));
    }, [productsData, favoriteProductIds]);

    // === Завантаження username ===
    useEffect(() => {
        if (profileData?.username) {
            setUsername(profileData.username);
        }
    }, [profileData]);

    // === ЖАНРИ ===
    const genres = [
        { key: 'openWorld', value: 'Open World', translationKey: 'openWorld' },
        { key: 'rpg', value: 'RPG', translationKey: 'rpg' },
        { key: 'action', value: 'Action', translationKey: 'action' },
        { key: 'shooter', value: 'Shooter', translationKey: 'shooter' },
        { key: 'indie', value: 'Indie', translationKey: 'indie' },
        { key: 'strategy', value: 'Strategy', translationKey: 'strategy' },
        { key: 'horror', value: 'Horror', translationKey: 'horror' },
        { key: 'racing', value: 'Racing', translationKey: 'racing' },
    ];

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

        return filtered;
    }, [games, searchQuery, selectedGenre, selectedSale]);

    // === ФІЛЬТРИ ===
    const handleNavClick = (nav: string) => {
        setActiveNav(nav);
        setShowCategories(false);
        setShowSale(false);
        setSelectedGenre(null);
        setSelectedSale(null);
    };

    const filterByGenre = (genreValue: string) => {
        setSelectedGenre(genreValue);
        setSelectedSale(null);
        setActiveNav('Categories');
        setShowCategories(false);
    };

    const filterBySale = (option: string) => {
        setSelectedSale(option);
        setSelectedGenre(null);
        setActiveNav('Sale');
        setShowSale(false);
    };

    const isSaleView = activeNav === 'Sale' || !!selectedSale;

    // === CART ===
    const handleAddToCart = (game: Game) => {
        const existingItem = cartItems.find(item => item.game.id === game.id);
        if (existingItem) {
            setCartItems(prev =>
                prev.map(item =>
                    item.game.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            setCartItems(prev => [...prev, { game, quantity: 1, forMyAccount: true }]);
        }
    };

    const handleUpdateQuantity = (gameId: number, quantity: number) => {
        setCartItems(prev =>
            prev.map(item => (item.game.id === gameId ? { ...item, quantity } : item))
        );
    };

    const handleRemoveItem = (gameId: number) => {
        setCartItems(prev => prev.filter(item => item.game.id !== gameId));
    };

    const handleToggleAccountType = (gameId: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.game.id === gameId ? { ...item, forMyAccount: !item.forMyAccount } : item
            )
        );
    };

    const handleClearCart = () => {
        setCartItems([]);
    };

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
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? <MdNightlight className={styles.sunIcon} /> : <MdWbSunny className={styles.sunIcon} />}
                    </button>

                    <button
                        aria-label={t('aria.shoppingCart')}
                        onClick={() => setIsCartOpen(true)}
                    >
                        <MdShoppingCart />
                        {cartItems.length > 0 && (
                            <span className={styles.cartBadge}>{cartItems.length}</span>
                        )}
                    </button>

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
                                        setLanguage('en');
                                        setShowLanguageDropdown(false);
                                    }}
                                >
                                    {t('language.english')}
                                </button>
                                <button
                                    className={`${styles.languageOption} ${language === 'uk' ? styles.active : ''}`}
                                    onClick={() => {
                                        setLanguage('uk');
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

                <div className={styles.dropdown}>
                    <button
                        className={`${styles.navButton} ${activeNav === 'Categories' ? styles.navActive : ''}`}
                        onClick={() => {
                            setShowCategories(!showCategories);
                            setShowSale(false);
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
                                    <span>{t(`genres.${g.translationKey}`)}</span>
                                    {selectedGenre === g.value && <MdCheck className={styles.checkIcon} />}
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
                    <p className={styles.noGames}>
                        {t('loading') || 'Loading...'}
                    </p>
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
                                <SaleCard
                                    key={game.id}
                                    game={game}
                                    onToggleFavorite={toggleFavorite}
                                    onAddToCart={handleAddToCart}
                                    isDarkMode={isDarkMode}
                                />
                            );
                        }
                        return (
                            <GameCard
                                key={game.id}
                                game={game}
                                onToggleFavorite={toggleFavorite}
                                onAddToCart={handleAddToCart}
                                isDarkMode={isDarkMode}
                            />
                        );
                    })
                )}
            </main>

            {/* === Cart Popup === */}
            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onToggleAccountType={handleToggleAccountType}
                onClearCart={handleClearCart}
                language={language}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};

export default StorePage;