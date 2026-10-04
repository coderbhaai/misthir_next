import AddUpdateSaleForm from '@amitkk/sales/admin/add-update-sales';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditAdminSaleId = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <AddUpdateSaleForm dataId={id as string} />;
};

export default EditAdminSaleId;
