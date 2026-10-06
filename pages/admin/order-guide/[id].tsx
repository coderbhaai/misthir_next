// import SingleAdminOrderGuide from '@amitkk/ecom/admin/SingleAdminOrderGuide';
import SingleAdminOrderGuide from '@amitkk/wishlist/admin/SingleAdminOrderGuide';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditProduct = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SingleAdminOrderGuide dataId={id as string} />;
};

export default EditProduct;
