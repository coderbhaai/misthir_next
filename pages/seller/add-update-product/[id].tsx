import SellerProductForm from '@amitkk/seller/admin/add-update-seller-product-form';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditSellerProduct = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SellerProductForm dataId={id as string} />;
};

export default EditSellerProduct;
