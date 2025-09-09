// pages/_app.tsx
import "../styles/globals.css";
import AdminLayout from "@amitkk/basic/utils/layouts/AdminLayout";
import AppLayout from "@amitkk/basic/utils/layouts/AppLayout";
import { AuthProvider } from "contexts/AuthContext";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import { CacheProvider, EmotionCache } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import createEmotionCache from "./createEmotionCache";
import theme from "pages/theme";

const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
  const router = useRouter();
  const adminLayout = ["/admin", "/vendor", "/user"].some(prefix =>
    router.pathname.startsWith(prefix)
  );

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {adminLayout ? (
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          ) : (
            <AppLayout meta={pageProps.meta}>
              <Component {...pageProps} />
            </AppLayout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}