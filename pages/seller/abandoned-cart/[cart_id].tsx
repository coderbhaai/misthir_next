import SellerSingleAbandonedCart from '@amitkk/seller/admin/seller-single-abandoned-cart'
import { useRouter } from 'next/router';

const EditSellerSingleAbandonedCart = () => {
  const router = useRouter();
  const { cart_id } = router.query;

  if (!router.isReady) return <div>Loading...</div>;
  if (!cart_id) return <div>Error: No ID found</div>;

  return <SellerSingleAbandonedCart dataId={cart_id as string}/>;
};

export default EditSellerSingleAbandonedCart;