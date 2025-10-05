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
import Providers from "contexts/Providers";

const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
  const router = useRouter();
  const adminLayout = ["/admin", "/seller", "/user"].some(prefix =>
    router.pathname.startsWith(prefix)
  );

  const delayedRender = (Component as any).delayLayoutRender ?? false;

  console.log("delayedRender", delayedRender)

  return (
    <Providers>
      {adminLayout ? (
        delayedRender ? (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        ) : (
          <Component {...pageProps} />
        )
      ) : (
        <AppLayout meta={pageProps.meta}>
          <Component {...pageProps} />
        </AppLayout>
      )}
    </Providers>
  );
}