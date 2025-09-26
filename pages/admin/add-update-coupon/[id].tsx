import SellerCouponForm from '@amitkk/seller/admin/add-update-seller-coupon-form';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditAdminCouponId = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SellerCouponForm dataId={id as string} />;
};

export default EditAdminCouponId;
