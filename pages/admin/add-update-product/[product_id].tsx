import SellerProductForm from '@amitkk/seller/admin/add-update-product-form';
import { useRouter } from 'next/router';

const EditAdminVendorProduct = () => {
  const router = useRouter();
  const { product_id } = router.query;

  if (!router.isReady) return <div>Loading...</div>;
  if (!product_id) return <div>Error: No ID found</div>;

  return <SellerProductForm dataId={product_id as string}/>;
};

export default EditAdminVendorProduct;