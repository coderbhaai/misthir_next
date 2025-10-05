// pages/seller/[...slug].tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sellerComponentMap } from "../../amitkk/componentMaps";
import { checkPermission, clo } from "@amitkk/basic/utils/utils";
import Loader from "@amitkk/basic/static/Loader";
import { getCookie } from "hooks/CookieHook";

const DynamicSellerPage: React.FC & { delayLayoutRender?: boolean } = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [Component, setComponent] = useState<React.FC<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const loadComponent = async () => {
      try {
        const redirectUrl = process.env.MODE === "dev" ? process.env.DEV_URL : process.env.PROD_URL;
        const token = getCookie("authToken");
        if (!token) {
          window.location.href = `${redirectUrl?.replace(/\/$/, "") ?? "http://localhost:3000"}/404`;
          return;
        }

        const slugParts = Array.isArray(slug) ? slug : [slug];
        const baseSlug = slugParts[0];

        const fullPath = `/seller/${slugParts.join("/")}`;
        const allowed = await checkPermission(fullPath);
        if (!allowed) {
          window.location.href = `${redirectUrl?.replace(/\/$/, "") ?? "http://localhost:3000"}/404`;
          return;
        }
        
        if (baseSlug && sellerComponentMap[baseSlug]) {
          const PageComponent = await sellerComponentMap[baseSlug]();
          setComponent(() => PageComponent.default);
        } else {
          throw new Error(`Unknown seller base slug: ${baseSlug}`);
        }
      } catch (error) {
        clo(error);
        const NotFoundComponent = () => <h1>Page Not Found</h1>;
        setComponent(() => NotFoundComponent);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [slug, router.isReady]);
  
  if (loading) return <Loader message="Loading seller page..." />;
  if (!Component) return <h1>Page Not Found</h1>;

  return (
      <Component
        module={Array.isArray(slug) && slug[1] ? slug[1] : ""}
        module_id={Array.isArray(slug) && slug[2] ? slug[2] : ""}
      />
  );
};

DynamicSellerPage.delayLayoutRender = true;

export default DynamicSellerPage;