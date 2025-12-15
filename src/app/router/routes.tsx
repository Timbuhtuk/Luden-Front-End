import { createBrowserRouter } from 'react-router-dom';
import { App } from '@app/App';
import { LoginPage } from '@pages/LoginPage';
import { RegistrationPage } from '@pages/RegistrationPage';
import { ProfilePage } from '@pages/ProfilePage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { EditProfilePage } from '@pages/EditProfilePage';
import { StorePage } from '@pages/StorePage';

export const router = createBrowserRouter(
    [
        {
            element: <App />,
            children: [
                {
                    path: '/',
                    element: <LoginPage />,
                },
                {
                    path: '/registration',
                    element: <RegistrationPage />,
                },
                {
                    path: '/profile',
                    element: <ProfilePage />,
                },
                {
                    path: '/resetPass',
                    element: <ForgotPasswordPage />,
                },
                {
                    path: '/editProfile',
                    element: <EditProfilePage />,
                },
                {
                    path: '/store',
                    element: <StorePage />,
                },
            ],
        },
    ],
    {
        basename: '/Luden-Front-End',
    }
);

