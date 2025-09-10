// context/Providers.tsx
import { ReactNode } from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthContext';
import { EcomProvider } from './EcomContext';
import createEmotionCache from 'pages/createEmotionCache';
import theme from 'pages/theme';

const clientSideEmotionCache = createEmotionCache();

type ProvidersProps = {
  children: ReactNode;
  emotionCache?: EmotionCache;
};

export default function Providers({ children, emotionCache = clientSideEmotionCache }: ProvidersProps) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <EcomProvider>
            {children}
          </EcomProvider>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
