import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '@shared/store';
import { ThemeProvider } from './ThemeProvider';
import { LanguageProvider } from './LanguageProvider';
import type { ReactNode } from 'react';

const googleClientId = "737632939461-oh6135nrbqckjm0lrbof5dmp396ridqk.apps.googleusercontent.com";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            {children}
          </GoogleOAuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}

export * from './ThemeProvider';
export * from './LanguageProvider';

