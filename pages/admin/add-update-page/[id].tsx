"use client"

import PageForm from '@amitkk/basic/components/page/add-update-page-form';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditBlog = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <PageForm selectedDataId={id as string} />;
};

export default EditBlog;
