import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePalette } from 'color-thief-react';
import { MdArrowBack, MdPhotoCamera, MdSave } from 'react-icons/md';
import { getTextColor } from '../../utils/colorUtils';
import UserService from '../../services/UserService';
import styles from './styles.module.css';
import { useTheme } from '../../context/ThemeContext';

interface User {
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
    avatarUrl?: string;
}

export const EditProfilePage = () => {
    const { isDarkMode } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { data: colorPalette } = usePalette(avatar || '', 2, 'hex', {
        crossOrigin: 'Anonymous',
        quality: 10,
    });

    const dominantColor = colorPalette?.[0] || (isDarkMode ? '#333' : '#888');
    const textColor = getTextColor(dominantColor);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newAvatar = URL.createObjectURL(file);
            setAvatar(newAvatar);
            setAvatarFile(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const updateData: { username?: string; email?: string; avatar?: File } = {};

            if (user.username) updateData.username = user.username;
            if (user.email) updateData.email = user.email;
            if (avatarFile) updateData.avatar = avatarFile;

            const result = await UserService.updateUser(updateData);
            if (result) {
                alert('Profile updated successfully');
            }
            navigate('/profile');
        } catch (error: any) {
            alert('Error: ' + (error.message || 'Failed to update profile'));
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = () => {
        navigate('/resetPass');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileData = await UserService.getProfile();
                if (profileData) {
                    setUser({
                        username: profileData.username,
                        email: profileData.email,
                        role: profileData.role,
                        createdAt: profileData.createdAt,
                        updatedAt: profileData.updatedAt,
                        avatarUrl: profileData.avatarUrl,
                    });

                    if (profileData.avatarUrl) {
                        setAvatar(profileData.avatarUrl);
                    }
                }
            } catch (error: any) {
                alert('Error loading profile: ' + (error.message || 'Unknown error'));
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading || !user) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={`${styles.editProfilePage} ${isDarkMode ? styles.dark : ''}`}>
            {/* Blur background */}
            <div
                className={styles.blurBackground}
                style={{
                    background: colorPalette
                        ? `linear-gradient(135deg, ${colorPalette[0]}, ${colorPalette[1]})`
                        : isDarkMode
                            ? 'linear-gradient(135deg, #222, #444)'
                            : 'linear-gradient(135deg, #888, #555)',
                    opacity: isDarkMode ? 0.5 : 0.3,
                }}
            />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpg, image/jpeg, image/gif"
            />

            <header className={styles.header}>
                <button
                    className={`${styles.headerButton} ${styles.backButton}`}
                    onClick={() => navigate('/profile')}
                >
                    <MdArrowBack /> Back to Profile
                </button>
            </header>

            <main>
                <div
                    className={styles.userCard}
                    style={{
                        background: colorPalette
                            ? `linear-gradient(90deg, ${colorPalette[0]}, ${colorPalette[1]})`
                            : isDarkMode
                                ? 'linear-gradient(90deg, #333, #555)'
                                : 'linear-gradient(90deg, #888, #555)',
                    }}
                >
                    <div className={styles.avatarContainer} onClick={handleAvatarClick}>
                        {avatar ? (
                            <img src={avatar} alt="User Avatar" className={styles.avatarImage} />
                        ) : (
                            <MdPhotoCamera className={styles.avatarIcon} />
                        )}
                        <div className={styles.avatarOverlay}>
                            <MdPhotoCamera className={styles.cameraIcon} />
                        </div>
                    </div>
                    <span className={styles.username} style={{ color: textColor }}>
                        {user.username}
                    </span>
                </div>

                <div className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            className={styles.input}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <button
                            className={styles.resetPasswordButton}
                            onClick={handleResetPassword}
                        >
                            Reset Password
                        </button>
                    </div>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </main>
        </div>
    );
};