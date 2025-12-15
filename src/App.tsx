import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { StorePage } from './pages/StorePage';
import { ThemeProvider } from './context';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

const googleClientId = "737632939461-oh6135nrbqckjm0lrbof5dmp396ridqk.apps.googleusercontent.com";

function App() {
    return (
<ThemeProvider>
    <LanguageProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
                <Routes>
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/registration" element={<RegistrationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/resetPass" element={<ForgotPasswordPage />} />
                    <Route path="/editProfile" element={<EditProfilePage />} />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
        </LanguageProvider>
</ThemeProvider>
    );
}

export default App;