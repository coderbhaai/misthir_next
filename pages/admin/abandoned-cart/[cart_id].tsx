
import SingleAbandoneCart from '@amitkk/ecom/admin/single-abandoned-cart';
import { useRouter } from 'next/router';

const EditSingleAbandoneCart = () => {
  const router = useRouter();
  const { cart_id } = router.query;

  if (!router.isReady) return <div>Loading...</div>;
  if (!cart_id) return <div>Error: No ID found</div>;

  return <SingleAbandoneCart dataId={cart_id as string}/>;
};

export default EditSingleAbandoneCart;