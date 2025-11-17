import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { usePalette } from 'color-thief-react';
import { useTranslation } from '@shared/lib';
import {
    MdArrowBack,
    MdOutlineNotifications,
    MdOutlineSettings,
    MdSportsEsports,
    MdStar,
    MdAccountCircle,
    MdPhotoCamera,
    MdEdit,
    MdLogout,
    MdSwitchAccount,
    MdAdd,
    MdCardGiftcard,
    MdEmojiEvents,
    MdLanguage,
    MdWbSunny,
    MdNightlight,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getTextColor } from '@shared/lib/color-utils';
import type { BillDto, ProductDto } from '@shared/types';
import type { Game } from '@shared/types';
import { useGetUserProfileQuery, useGetUserBillsQuery, useGetUserProductsQuery, useUpdateUserMutation } from '@entities/User';
import { useLoginMutation } from '@features/auth';
import { BillCard, ProductCard, GameCard } from '@shared/ui';
import { useRemoveFavoriteMutation } from '@entities/Favorite';
import { useTheme } from '@app/providers';
import { useGetFavoritesQuery } from '@entities/Favorite';
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

export const ProfilePage = () => {
    const { t, setLanguage, language } = useTranslation();
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { data: profileData, refetch: refetchProfile } = useGetUserProfileQuery();
    const { data: billsData, isLoading: isLoadingBills } = useGetUserBillsQuery();
    const { data: productsData, isLoading: isLoadingProducts } = useGetUserProductsQuery();
    const { data: favoritesData, isLoading: isLoadingFavorites } = useGetFavoritesQuery();
    const [updateUser] = useUpdateUserMutation();
    const [login] = useLoginMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();
    
    const [user, setUser] = useState<{ username: string; email: string; role: string; avatar: string } | null>(null);
    const [bills, setBills] = useState<BillDto[]>([]);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);
    const switchAccountRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('myLibrary');

    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [avatarVersion, setAvatarVersion] = useState<number>(0);
    const [palette, setPalette] = useState<string[] | null>(null);

    // === Оновлюємо дані з RTK Query ===
    useEffect(() => {
        if (profileData) {
            setUser({
                username: profileData.username || '',
                email: profileData.email || '',
                role: profileData.role || 'user',
                avatar: profileData.avatarUrl || '',
            });
            setAvatarUrl(profileData.avatarUrl || '');
        }
    }, [profileData]);

    useEffect(() => {
        if (billsData) {
            setBills(billsData);
        }
    }, [billsData]);

    useEffect(() => {
        if (productsData) {
            setProducts(productsData);
        }
    }, [productsData]);

    // === Оновлюємо URL + версію ===
    useEffect(() => {
        if (user?.avatar) {
            setAvatarUrl(user.avatar);
            setAvatarVersion(prev => prev + 1);
        }
    }, [user?.avatar]);

    // === usePalette з ключем (виправлено TS2345) ===
    const paletteKey = `${avatarUrl}?v=${avatarVersion}`;
    const { data: colorPaletteData } = usePalette(paletteKey, 2, 'hex', {
        crossOrigin: 'Anonymous',
        quality: 10,
    });

    useEffect(() => {
        if (colorPaletteData) {
            setPalette(colorPaletteData);
        }
    }, [colorPaletteData, paletteKey]);

    // === Градієнти ===
    const backgroundGradient = useMemo(() => {
        if (palette) {
            return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
        }
        return isDarkMode
            ? 'linear-gradient(135deg, #222, #444)'
            : 'linear-gradient(135deg, #888, #555)';
    }, [palette, isDarkMode]);

    const userCardGradient = useMemo(() => {
        if (palette) {
            return `linear-gradient(90deg, ${palette[0]}, ${palette[1]})`;
        }
        return isDarkMode
            ? 'linear-gradient(90deg, #333, #555)'
            : 'linear-gradient(90deg, #888, #555)';
    }, [palette, isDarkMode]);

    const dominantColor = palette?.[0] || '#888';
    const textColor = getTextColor(dominantColor);

    // === Завантаження ===
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    // === Оновлення аватарки ===
    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            try {
                const formData = new FormData();
                formData.append('Avatar', file);
                const result = await updateUser(formData).unwrap();
                if (result && (result as any).avatarUrl) {
                    const newUrl = `${(result as any).avatarUrl}?t=${Date.now()}`;
                    setUser(prev => prev ? { ...prev, avatar: newUrl } : null);
                    setAvatarVersion(prev => prev + 1);
                    refetchProfile();
                    alert(t('profile.avatarUploaded'));
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert(t('profile.avatarUploadFailed'));
            }
        }
    };

    const handleSwitchAccount = async (email: string, password: string) => {
        try {
            const result = await login({ email, password }).unwrap();
            if (result?.token) {
                localStorage.setItem('authToken', result.token);
                refetchProfile();
                setIsSwitchAccountOpen(false);
                alert(t('profile.switchedToAccount', { email }));
            } else {
                alert(t('profile.switchAccountFailed'));
            }
        } catch (error) {
            console.error('Error switching account:', error);
            alert(t('profile.switchAccountError'));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    // === Обробники ===
    const handleSettingsToggle = () => {
        setIsSettingsOpen(!isSettingsOpen);
        setIsSwitchAccountOpen(false);
    };

    const handleSwitchAccountToggle = () => {
        setIsSwitchAccountOpen(!isSwitchAccountOpen);
        setIsSettingsOpen(false);
    };


    const handleAddNewAccount = () => {
        setIsSwitchAccountOpen(false);
        navigate('/registration');
    };

    const handleEditProfile = () => {
        setIsSettingsOpen(false);
        navigate('/editProfile');
    };

    const handleLogout = () => {
        setIsSettingsOpen(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
            if (switchAccountRef.current && !switchAccountRef.current.contains(event.target as Node)) {
                setIsSwitchAccountOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return <div>{t('profile.loading')}</div>; // ← ПЕРЕКЛАД
    }

    return (
        <div className={`${styles.profilePage} ${isDarkMode ? styles.dark : ''}`}>
            {/* === Blur Background === */}
            <div
                className={styles.blurBackground}
                style={{
                    background: backgroundGradient,
                    opacity: isDarkMode ? 0.5 : 0.3,
                }}
            />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/gif"
            />

            <header className={styles.header}>
                <button className={`${styles.headerButton} ${styles.backButton}`} onClick={() => navigate('/store')}>
                    <MdArrowBack /> {t('backToStore')} {/* ← ПЕРЕКЛАД */}
                </button>
                <div className={styles.headerIcons}>
                    <button 
                        className={styles.headerButton}
                        onClick={() => setLanguage(language === 'en' ? 'uk' : 'en')}
                        aria-label={t('aria.toggleLanguage')}
                    >
                        <MdLanguage />
                    </button>
                    <button
                        className={styles.headerButton}
                        onClick={toggleDarkMode}
                        aria-label={t('aria.toggleTheme')}
                    >
                        {isDarkMode ? <MdWbSunny /> : <MdNightlight />}
                    </button>
                    <button className={styles.headerButton}><MdOutlineNotifications /></button>
                    {profileData?.bonusPoints !== undefined && (
                        <div className={styles.bonusInfo}>
                            <MdEmojiEvents className={styles.bonusInfoIcon} />
                            <span className={styles.bonusInfoText}>
                                {Math.floor(profileData.bonusPoints).toLocaleString()} {t('profile.bonuses') || 'бонусів'}
                            </span>
                        </div>
                    )}
                    <div className={styles.settingsDropdown} ref={settingsRef}>
                        <button className={styles.headerButton} onClick={handleSettingsToggle}>
                            <MdOutlineSettings />
                        </button>
                        {isSettingsOpen && (
                            <ul className={styles.dropdownMenu}>
                                <li className={styles.dropdownItem} onClick={handleEditProfile}>
                                    <MdEdit /> {t('profile.editProfile')} {/* ← ПЕРЕКЛАД */}
                                </li>
                                <li className={styles.dropdownItem} onClick={handleSwitchAccountToggle}>
                                    <MdSwitchAccount /> {t('profile.switchAccount')} {/* ← ПЕРЕКЛАД */}
                                </li>
                                <li className={styles.dropdownItem} onClick={handleLogout}>
                                    <MdLogout /> {t('profile.logout')} {/* ← ПЕРЕКЛАД */}
                                </li>
                            </ul>
                        )}
                    </div>
                    {isSwitchAccountOpen && (
                        <div className={styles.switchAccountDropdown} ref={switchAccountRef}>
                            <ul className={styles.dropdownMenu}>
                                <li
                                    className={`${styles.dropdownItem} ${styles.currentAccount}`}
                                    onClick={() => handleSwitchAccount(user.email, '')}
                                >
                                    <MdAccountCircle /> {user.username} {t('profile.current')} {/* ← ПЕРЕКЛАД */}
                                </li>
                                <li className={styles.dropdownItem} onClick={handleAddNewAccount}>
                                    <MdAdd /> {t('profile.addNewAccount')} {/* ← ПЕРЕКЛАД */}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            <main>
                <div className={styles.userCard} style={{ background: userCardGradient }}>
                    <div className={styles.avatarContainer} onClick={handleAvatarClick}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={t('aria.profileAvatar') || 'User Avatar'} // ← ПЕРЕКЛАД (опціонально)
                                className={styles.avatarImage}
                                key={avatarVersion}
                            />
                        ) : (
                            <MdAccountCircle className={styles.avatarIcon} />
                        )}
                        <div className={styles.avatarOverlay}>
                            <MdPhotoCamera className={styles.cameraIcon} />
                        </div>
                    </div>
                    <span className={styles.nickname} style={{ color: textColor }}>
                        {user.username}
                    </span>
                </div>

                <nav className={styles.navigation}>
                    <button
                        className={`${styles.navButton} ${activeTab === 'myLibrary' ? styles.active : ''}`}
                        onClick={() => setActiveTab('myLibrary')}
                    >
                        <MdSportsEsports /> {t('profile.myLibrary')} {/* ← ПЕРЕКЛАД */}
                    </button>
                    <button
                        className={`${styles.navButton} ${activeTab === 'bills' ? styles.active : ''}`}
                        onClick={() => setActiveTab('bills')}
                    >
                        <MdCardGiftcard /> {t('profile.bills')} {/* ← ПЕРЕКЛАД */}
                    </button>
                    <button
                        className={`${styles.navButton} ${activeTab === 'favorites' ? styles.active : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <MdStar /> {t('profile.favorites')} {/* ← ПЕРЕКЛАД */}
                    </button>
                </nav>

                <div className={styles.contentArea}>
                    {activeTab === 'myLibrary' && (
                        <div className={styles.gameGrid}>
                            {isLoadingProducts ? (
                                <div className={styles.emptyState}>
                                    <MdSportsEsports className={styles.emptyIcon} />
                                    <p>{t('loading') || 'Loading...'}</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdSportsEsports className={styles.emptyIcon} />
                                    <p>{t('profile.noGamesInLibrary')}</p>
                                    <p className={styles.emptyHint}>{t('profile.purchaseGames')}</p>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'bills' && (
                        <div className={styles.gameGrid}>
                            {isLoadingBills ? (
                                <div className={styles.emptyState}>
                                    <MdCardGiftcard className={styles.emptyIcon} />
                                    <p>{t('loading') || 'Loading...'}</p>
                                </div>
                            ) : bills.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdCardGiftcard className={styles.emptyIcon} />
                                    <p>{t('profile.noBills')}</p>
                                    <p className={styles.emptyHint}>{t('profile.browseStore')}</p>
                                </div>
                            ) : (
                                bills.map((bill) => (
                                    <BillCard key={bill.id} bill={bill} />
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'favorites' && (
                        <div className={styles.gameGrid}>
                            {isLoadingFavorites ? (
                                <div className={styles.emptyState}>
                                    <MdStar className={styles.emptyIcon} />
                                    <p>{t('loading') || 'Loading...'}</p>
                                </div>
                            ) : !favoritesData || favoritesData.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdStar className={styles.emptyIcon} />
                                    <p>{t('profile.noFavorites')}</p>
                                    <p className={styles.emptyHint}>{t('profile.addToFavorites')}</p>
                                </div>
                            ) : (
                                favoritesData
                                    .filter(fav => fav.product) // Фильтруем только те, у которых есть продукт
                                    .map((fav) => {
                                        const product = fav.product!;
                                        const game: Game = {
                                            id: product.id,
                                            title: product.name || 'Untitled',
                                            image: getProductImageUrl(product),
                                            price: `${product.price.toLocaleString()} €`,
                                            genre: product.region?.name || undefined,
                                            isFavorite: true,
                                            discountPercent: null,
                                        };
                                        return (
                                            <GameCard
                                                key={game.id}
                                                game={game}
                                                isDarkMode={isDarkMode}
                                                noHover={true}
                                                onToggleFavorite={async (gameId) => {
                                                    try {
                                                        await removeFavorite(gameId).unwrap();
                                                    } catch (error) {
                                                        console.error('Error removing favorite:', error);
                                                    }
                                                }}
                                            />
                                        );
                                    })
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;