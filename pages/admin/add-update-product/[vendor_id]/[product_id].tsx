import SellerProductForm from '@amitkk/product/seller/components/add-update-seller-product-form';
import { useRouter } from 'next/router';

const EditAdminVendorProduct = () => {
  const router = useRouter();
  const { vendor_id, product_id } = router.query;

  if (!router.isReady) return <div>Loading...</div>;
  if (!vendor_id || !product_id) return <div>Error: No ID found</div>;

  return <SellerProductForm dataId={product_id as string} vendorId={vendor_id as string} />;
};

export default EditAdminVendorProduct;