import SellerSalesForm from '@amitkk/seller/admin/add-update-sales';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditSellerSales = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SellerSalesForm dataId={id as string} />;
};

export default EditSellerSales;
