// pages > user > [...slug].tsx

"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { userComponentMap } from "../../amitkk/componentMaps";
import { getCookie } from "hooks/CookieHook";
import { get404Url } from "@amitkk/basic/utils/my-utils/client-utils";
import { clo } from "@amitkk/basic/utils/my-utils/client-api";

const DynamicUserPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [Component, setComponent] = useState<React.FC<any> | null>(null);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const loadComponent = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) {
          window.location.href = get404Url();
          return;
        }

        const slugParts = Array.isArray(slug) ? slug : [slug];
        const baseSlug = slugParts[0];

        if (baseSlug && userComponentMap[baseSlug]) {
          // 💡 Fix: Call .loader() here
          const mapEntry = userComponentMap[baseSlug];
          const PageComponent = await mapEntry.loader();
          setComponent(() => PageComponent.default || PageComponent);
        } else {
          throw new Error(`Unknown base slug: ${baseSlug}`);
        }
      } catch (error) {
        const NotFoundComponent = () => <h1>Page Not Found</h1>;
        NotFoundComponent.displayName = "NotFoundPage";
        setComponent(() => NotFoundComponent);
        clo(error);
      }
    };

    loadComponent();
  }, [slug, router.isReady]);
  
  if (!Component) return <h1>Loading...</h1>;

  return (
    <Component module={Array.isArray(slug) && slug[1] ? slug[1] : ""} module_id={Array.isArray(slug) && slug[2] ? slug[2] : ""}/>
  );
};

DynamicUserPage.delayLayoutRender = true;

export default DynamicUserPage;