import BlogForm from '@amitkk/blog/components/add-update-blog-form';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const EditBlog = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
  }, [router.query]);

  if (!router.isReady) return <div>Loading...</div>;

  if (!id) return <div>Error: No ID found</div>;

  return <BlogForm dataId={id as string} />;
};

export default EditBlog;
