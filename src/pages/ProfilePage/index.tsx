import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { usePalette } from 'color-thief-react';
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
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getTextColor } from '../../utils/colorUtils';
import type { Bill, Product } from '../../models/Bill.ts';
import type { User } from '../../models/User.ts';
import type { Bonus } from '../../models/Bonus.ts';
import type { Game } from '../../models/Game.ts';
import UserService from '../../services/UserService';
import BillService from '../../services/BillService';
import { BillCard } from '../../components/BillCard';
import { ProductCard } from '../../components/ProductCard';
import { useTheme } from '../../context';

export const ProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [bonuses] = useState<Bonus[]>([]);
    const [favorites] = useState<Game[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);
    const switchAccountRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('My library');

    // НОВЕ: URL + ключ для примусового оновлення
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [avatarVersion, setAvatarVersion] = useState<number>(0);

    const [palette, setPalette] = useState<string[] | null>(null);
    const { isDarkMode } = useTheme();

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
    const fetchUserData = async () => {
        try {
            const profileData = await UserService.getProfile();
            if (profileData) {
                setUser({
                    id: 0,
                    username: profileData.username,
                    password_hash: '',
                    created_at: new Date(profileData.createdAt),
                    updated_at: profileData.updatedAt ? new Date(profileData.updatedAt) : undefined,
                    email: profileData.email,
                    role: profileData.role as 'user' | 'admin' | 'moderator',
                    avatar: profileData.avatarUrl || '',
                });
                setBills(profileData.bills || []);
                setProducts(profileData.products || []);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            navigate('/');
        }
    };

    const fetchUserBills = async () => {
        try {
            const billsData = await BillService.getUserBills();
            if (billsData) {
                setBills(billsData);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    // === Оновлення аватарки ===
    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            try {
                const result = await UserService.updateUser({ avatar: file });
                if (result && result.avatarUrl) {
                    const newUrl = `${result.avatarUrl}?t=${Date.now()}`;
                    setUser(prev => prev ? { ...prev, avatar: newUrl } : null);
                    setAvatarVersion(prev => prev + 1); // Примусово оновити usePalette
                    alert('Avatar uploaded successfully!');
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Failed to upload avatar');
            }
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

    const handleSwitchAccount = async (email: string, password: string) => {
        try {
            const result = await UserService.login({ email, password });
            if (result?.token) {
                localStorage.setItem('authToken', result.token);
                await fetchUserData();
                setIsSwitchAccountOpen(false);
                alert(`Switched to account: ${email}`);
            } else {
                alert('Failed to switch account');
            }
        } catch (error) {
            console.error('Error switching account:', error);
            alert('An error occurred while switching account');
        }
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
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchUserData();
            fetchUserBills();
        } else {
            navigate('/');
        }
    }, []);

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
        return <div>Loading...</div>;
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
                    <MdArrowBack /> Back to store
                </button>
                <div className={styles.headerIcons}>
                    <button className={styles.headerButton}><MdOutlineNotifications /></button>
                    <div className={styles.settingsDropdown} ref={settingsRef}>
                        <button className={styles.headerButton} onClick={handleSettingsToggle}>
                            <MdOutlineSettings />
                        </button>
                        {isSettingsOpen && (
                            <ul className={styles.dropdownMenu}>
                                <li className={styles.dropdownItem} onClick={handleEditProfile}>
                                    <MdEdit /> Edit profile
                                </li>
                                <li className={styles.dropdownItem} onClick={handleSwitchAccountToggle}>
                                    <MdSwitchAccount /> Switch account
                                </li>
                                <li className={styles.dropdownItem} onClick={handleLogout}>
                                    <MdLogout /> Logout
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
                                    <MdAccountCircle /> {user.username} (Current)
                                </li>
                                <li className={styles.dropdownItem} onClick={handleAddNewAccount}>
                                    <MdAdd /> Add new account
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            <main>
                <div
                    className={styles.userCard}
                    style={{ background: userCardGradient }}
                >
                    <div className={styles.avatarContainer} onClick={handleAvatarClick}>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="User Avatar"
                                className={styles.avatarImage}
                                key={avatarVersion} // Примусово оновити img
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
                        className={`${styles.navButton} ${activeTab === 'My library' ? styles.active : ''}`}
                        onClick={() => setActiveTab('My library')}
                    >
                        <MdSportsEsports /> My library
                    </button>
                    <button
                        className={`${styles.navButton} ${activeTab === 'Bonuses' ? styles.active : ''}`}
                        onClick={() => setActiveTab('Bonuses')}
                    >
                        <MdEmojiEvents /> Bonuses
                    </button>
                    <button
                        className={`${styles.navButton} ${activeTab === 'Bills' ? styles.active : ''}`}
                        onClick={() => setActiveTab('Bills')}
                    >
                        <MdCardGiftcard /> Bills
                    </button>
                    <button
                        className={`${styles.navButton} ${activeTab === 'Favorites' ? styles.active : ''}`}
                        onClick={() => setActiveTab('Favorites')}
                    >
                        <MdStar /> Favorites
                    </button>
                </nav>

                <div className={styles.contentArea}>
                    {activeTab === 'My library' && (
                        <div className={styles.gameGrid}>
                            {products.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdSportsEsports className={styles.emptyIcon} />
                                    <p>No games in your library</p>
                                    <p className={styles.emptyHint}>Purchase games to add them to your library</p>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'Bonuses' && (
                        <div className={styles.bonusList}>
                            {bonuses.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdEmojiEvents className={styles.emptyIcon} />
                                    <p>No bonuses available</p>
                                    <p className={styles.emptyHint}>Complete achievements to earn bonuses</p>
                                </div>
                            ) : (
                                bonuses.map((bonus) => (
                                    <div key={bonus.id} className={styles.bonusItem}>
                                        <span className={styles.bonusName}>{bonus.name}</span>
                                        <span className={styles.bonusDescription}>{bonus.description}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'Bills' && (
                        <div className={styles.gameGrid}>
                            {bills.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdCardGiftcard className={styles.emptyIcon} />
                                    <p>No bills available</p>
                                    <p className={styles.emptyHint}>Browse the store to make a purchase</p>
                                </div>
                            ) : (
                                bills.map((bill) => (
                                    <BillCard key={bill.id} bill={bill} />
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'Favorites' && (
                        <div className={styles.gameGrid}>
                            {favorites.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <MdStar className={styles.emptyIcon} />
                                    <p>No favorites yet</p>
                                    <p className={styles.emptyHint}>Add games to your favorites list</p>
                                </div>
                            ) : (
                                favorites.map((game) => (
                                    <div key={game.id} className={styles.gameCard}>
                                        <img src={game.image} alt={game.title} />
                                        <div className={styles.gameInfo}>
                                            <h3>{game.title}</h3>
                                            <p>{game.price}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;