import { clo } from "@amitkk/basic/utils/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DynamicAdminPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [Component, setComponent] = useState<React.FC | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadComponent = async () => {
      try {
        const PageComponent = await import(`../../../amitkk/blog/${slug}`);
        setComponent(() => PageComponent.default);
      } catch (error) {
        const NotFoundComponent = () => <h1>Page Not Found</h1>;
        NotFoundComponent.displayName = 'NotFoundPage';
        setComponent(() => NotFoundComponent);
        clo( error )
      }
    };

    loadComponent();
  }, [slug]);

  if (!Component) return <h1>Loading...</h1>;
  return <Component />;
};

export default DynamicAdminPage;