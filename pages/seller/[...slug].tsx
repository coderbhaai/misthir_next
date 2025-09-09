// pages > admin > [...slug].tsx

"use client";
import { checkPermission, clo } from "@amitkk/basic/utils/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sellerComponentMap } from "../../amitkk/componentMaps";

const DynamicAdminPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [Component, setComponent] = useState<React.FC<any> | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const loadComponent = async () => {
      try {
        const slugParts = Array.isArray(slug) ? slug : [slug];
        const baseSlug = slugParts[0];

        const fullPath = `/admin/seller/${slugParts.join("/")}`;
        const allowed = await checkPermission(fullPath);
        if (!allowed) {
          setHasAccess(false);
          return;
        }
        setHasAccess(true);

        if (baseSlug && sellerComponentMap[baseSlug]) {
          const PageComponent = await sellerComponentMap[baseSlug]();
          setComponent(() => PageComponent.default);
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

  if (hasAccess === false) return <h1>You are Not Permitted</h1>;
  if (!Component) return <h1>Loading...</h1>;
  return (
    <Component module={Array.isArray(slug) && slug[1] ? slug[1] : ""} module_id={Array.isArray(slug) && slug[2] ? slug[2] : ""}/>
  );
};

export default DynamicAdminPage;