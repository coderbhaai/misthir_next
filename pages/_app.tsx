// pages > _app.tsx.

import "../styles/globals.css";
import type { AppProps } from "next/app";
import Providers from "contexts/Providers";
import Loader from "@amitkk/basic/static/Loader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@amitkk/basic/utils/layouts/AdminLayout";
import AppLayout from "@amitkk/basic/utils/layouts/AppLayout";
import GuestLayout from "@amitkk/basic/utils/layouts/Guest";
import { FilterProvider } from "contexts/FilterContext";
import { MenuProvider } from "contexts/MenuContext";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    const timer = setTimeout(() => setLoading(false), 600);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
      clearTimeout(timer);
    };
  }, [router]);

  const isPreviewPage = router.pathname.startsWith("/preview");
  const adminLayout = ["/admin", "/user"].some(prefix =>
    router.pathname.startsWith(prefix)
  );

  return (
    <MenuProvider>
      <Providers>
        <div>
          {loading && <Loader />}

          {isPreviewPage ? (
            <GuestLayout>
              <Component {...pageProps} />
            </GuestLayout>
          ) : adminLayout ? (
            <FilterProvider>
              <AdminLayout>
                <Component {...pageProps} />
              </AdminLayout>
            </FilterProvider>
          ) : (
            <AppLayout meta={pageProps.meta}>
              <Component {...pageProps} />
            </AppLayout>
          )}
        </div>
      </Providers>
    </MenuProvider>
  );
}

export default App;