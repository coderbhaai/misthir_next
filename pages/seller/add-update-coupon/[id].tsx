import SellerCouponForm from '@amitkk/seller/admin/add-update-seller-coupon-form';
import { useVendorId } from 'hooks/useVendorId';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditSellerCouponId = () => {
  const router = useRouter();
  const { id } = router.query;
  const vendor_id = useVendorId();

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SellerCouponForm dataId={id as string} vendor_id ={vendor_id as string} coupon_by="Vendor"/>;
};

export default EditSellerCouponId;
