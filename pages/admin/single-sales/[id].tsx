"use client"

import SingleSales from '@amitkk/ecom/admin/single-sales';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const SingleSaleIdPage = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <SingleSales dataId={id as string} />;
};

export default SingleSaleIdPage;
