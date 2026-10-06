// pages/admin/[...slug].tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { adminComponentMap } from "../../amitkk/componentMaps";
import { getCookie } from "hooks/CookieHook";
import Loader from "@amitkk/basic/static/Loader";
import { clo } from "@amitkk/basic/utils/my-utils/client-api";
import { checkPermission } from "@amitkk/basic/utils/my-utils/admin-utils";
import { get404Url } from "@amitkk/basic/utils/my-utils/client-utils";

interface DynamicAdminPageType extends React.FC {
  delayLayoutRender?: boolean;
}

const DynamicAdminPage: DynamicAdminPageType = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [Component, setComponent] = useState<React.FC<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const loadPage = async () => {
      try {
        const token = getCookie("authToken");
        if (!token) { return; }

        const slugParts = Array.isArray(slug) ? slug : [slug];
        const baseSlug = slugParts[0];
        const fullPath = `/admin/${slugParts.join("/")}`;
        
        const allowed = await checkPermission(fullPath);
        if (!allowed) {
          window.location.href = get404Url();
          return;
        }
        
        if (baseSlug && adminComponentMap[baseSlug]) {
          const mapEntry = adminComponentMap[baseSlug];
          const PageComponent = await mapEntry.loader();
          setComponent(() => PageComponent.default || PageComponent);
        } else {
          throw new Error(`Unknown base slug: ${baseSlug}`);
        }
      } catch (error) {
        clo(error);
        const NotFoundComponent = () => <h1 className="heading">XX Page Not Found</h1>;
        setComponent(() => NotFoundComponent);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [router.isReady, slug]);
  
  if (loading || !Component) {
    return <Loader/>;
  }

  return (
      <Component module={Array.isArray(slug) && slug[1] ? slug[1] : ""} module_id={Array.isArray(slug) && slug[2] ? slug[2] : ""}/>
  );
};

DynamicAdminPage.delayLayoutRender = true;
export default DynamicAdminPage;