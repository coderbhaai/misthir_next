// pages/admin/seller-service-areas/[seller_id].tsx

import SellerServiceAreas from '@amitkk/ecom/admin/seller-service-areas';
import { useRouter } from 'next/router';

const EditAdminSellerServiceArea = () => {
  const router = useRouter();
  const { seller_id } = router.query;

  if (!router.isReady) return <div>Loading...</div>;
  if (!seller_id) return <div>Error: No ID found</div>;

  return <SellerServiceAreas dataId={seller_id as string}/>;
};

export default EditAdminSellerServiceArea;