import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdLanguage, MdWbSunny, MdNightlight } from 'react-icons/md';
import styles from './styles.module.css';
import loginPattern from '../../assets/login-pattern.jpg';
import ludenLogo from '../../assets/luden-logo.svg';
import { useRegisterMutation, useLoginMutation } from '@features/auth';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useTranslation } from '@shared/lib';
import { useTheme } from '@app/providers';

export const RegistrationPage = () => {
    const navigate = useNavigate();
    const { t, setLanguage, language } = useTranslation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [register] = useRegisterMutation();
    const [login] = useLoginMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false); // ← ОДИН стан для обох
    const [message, setMessage] = useState('');

    const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/');
    };

    const handleSuccessfulLogin = (token: string) => {
        if (!token) {
            console.error('handleSuccessfulLogin called with empty token');
            handleFailedLogin(new Error('Token is empty'));
            return;
        }
        
        try {
            localStorage.setItem('authToken', token);
            setMessage(t('registration.registrationSuccess'));
            // Используем requestAnimationFrame для гарантии обновления UI перед редиректом
            requestAnimationFrame(() => {
                setTimeout(() => navigate('/profile'), 500);
            });
        } catch (error) {
            console.error('Failed to save token or navigate:', error);
            handleFailedLogin(new Error('Failed to complete registration process'));
        }
    };

    const handleFailedLogin = (error: any) => {
        const errorMessage = error.message || t('registration.unknownError');
        setMessage(t('registration.loginFailed').replace('{error}', errorMessage));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword) {
            setMessage(t('registration.fillAllFields'));
            return;
        }

        if (password !== confirmPassword) {
            setMessage(t('registration.passwordsMismatch'));
            return;
        }

        try {
            setMessage(t('registration.registering'));
            await register({ email, password }).unwrap();
            setMessage(t('registration.registrationComplete'));

            const loginResult = await login({ email, password }).unwrap();
            if (loginResult?.token) {
                handleSuccessfulLogin(loginResult.token);
            } else {
                setMessage(t('registration.couldNotLogin'));
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (regError: any) {
            if (regError.data?.message?.includes('EmailBusy') || regError.status === 400) {
                setMessage(t('registration.emailRegistered'));
                try {
                    const loginResult = await login({ email, password }).unwrap();
                    if (loginResult?.token) {
                        handleSuccessfulLogin(loginResult.token);
                    }
                } catch (loginError) {
                    handleFailedLogin(loginError);
                }
            } else {
                handleFailedLogin(regError);
            }
        }
    };

    const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
        setMessage(t('registration.processingGoogle'));

        if (!response.credential) {
            handleFailedLogin(new Error('Google did not provide credentials.'));
            return;
        }

        try {
            setMessage(t('registration.creatingAccount'));
            const registrationResult = await register({ googleJwtToken: response.credential }).unwrap();
            
            // Обрабатываем разные варианты структуры ответа
            const registerToken = registrationResult?.token || (registrationResult as any)?.data?.token;
            
            if (registerToken) {
                handleSuccessfulLogin(registerToken);
                return;
            }
            
            // Если регистрация не вернула токен, пытаемся залогиниться
            setMessage(t('registration.registrationComplete'));
            const loginResult = await login({ googleJwtToken: response.credential }).unwrap();
            const loginToken = loginResult?.token || (loginResult as any)?.data?.token;
            
            if (loginToken) {
                handleSuccessfulLogin(loginToken);
            } else {
                handleFailedLogin(new Error('Could not log in after registration.'));
            }
        } catch (regError: any) {
            if (regError.data?.message?.includes('EmailBusy') || regError.status === 400) {
                setMessage(t('registration.accountExists'));
                try {
                    const loginResult = await login({ googleJwtToken: response.credential }).unwrap();
                    const loginToken = loginResult?.token || (loginResult as any)?.data?.token;
                    
                    if (loginToken) {
                        handleSuccessfulLogin(loginToken);
                    } else {
                        handleFailedLogin(new Error('Could not log in with existing account.'));
                    }
                } catch (loginError) {
                    handleFailedLogin(loginError);
                }
            } else {
                handleFailedLogin(regError);
            }
        }
    };

    const clearInput = (inputId: string) => {
        if (inputId === 'email') setEmail('');
        else if (inputId === 'password') setPassword('');
        else if (inputId === 'confirmPassword') setConfirmPassword('');
    };

    return (
        <div className={`${styles.pageContainer} ${isDarkMode ? styles.dark : ''}`}>
            <div className={styles.leftPanel}>
                <img src={loginPattern} alt={t('registration.patternAlt')} className={styles.patternImage} />
            </div>

            <div className={styles.rightPanel}>
                {/* === 3 КНОПКИ УГОРУ === */}
                <div className={styles.topControls}>
                    {/* ОДИН ОЧИК — керує обома паролями */}
                    <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className={styles.controlButton}
                        aria-label={showPasswords ? t('aria.hidePassword') : t('aria.showPassword')}
                    >
                        {showPasswords ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>

                    <button
                        onClick={() => setLanguage(language === 'en' ? 'uk' : 'en')}
                        className={styles.controlButton}
                        aria-label={t('aria.toggleLanguage')}
                    >
                        <MdLanguage />
                    </button>

                    <button
                        onClick={toggleDarkMode}
                        className={styles.controlButton}
                        aria-label={t('aria.toggleTheme')}
                    >
                        {isDarkMode ? <MdWbSunny /> : <MdNightlight />}
                    </button>
                </div>

                <div className={styles.formContainer}>
                    <div className={styles.header}>
                        <h2>{t('registration.welcome')}</h2>
                        <img src={ludenLogo} alt="Luden Logo" className={styles.logo} />
                    </div>
                    <p className={styles.subtitle}>{t('registration.subtitle')}</p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">{t('registration.email')}</label>
                            <input
                                type="email"
                                id="email"
                                placeholder={t('registration.email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {email && (
                                <span className={styles.clearIcon} onClick={() => clearInput('email')} aria-label={t('aria.clearEmail')}>
                                    ×
                                </span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">{t('registration.password')}</label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                id="password"
                                placeholder={t('registration.password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password && (
                                <span className={styles.clearIcon} onClick={() => clearInput('password')} aria-label={t('aria.clearPassword')}>
                                    ×
                                </span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">{t('registration.confirmPassword')}</label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder={t('registration.confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmPassword && (
                                <span className={styles.clearIcon} onClick={() => clearInput('confirmPassword')} aria-label={t('aria.clearPassword')}>
                                    ×
                                </span>
                            )}
                        </div>

                        <button type="submit" className={styles.loginButton}>
                            {t('registration.signUpButton')}
                        </button>
                    </form>

                    {message && <p className={styles.message}>{message}</p>}

                    <div className={styles.divider}>
                        <span>{t('registration.orDivider')}</span>
                    </div>

                    <div className={styles.googleButtonContainer}>
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => setMessage(t('registration.googleLoginFailed'))}
                            type="standard"
                            theme={isDarkMode ? 'filled_black' : 'outline'}
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            width="300px"
                        />
                    </div>

                    <p className={styles.signupText}>
                        {t('registration.haveAccount')} <a href="#" onClick={handleLoginClick}>{t('login.loginButton')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};