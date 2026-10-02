import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { SingleBlogProps } from "@amitkk/basic/types/shared";

export default function Page() {
  const [blogs, setBlogs] = useState<SingleBlogProps[]>([]);

  useEffect(() => {
      const fetchSidebarData = async () => {
        try {
          const res = await apiRequest("GET", "basic/page?function=get_page_static_data");
          setBlogs(res?.data?.blogs ?? []);
        } catch (error) { clo(error); }
      };
      fetchSidebarData();
    }, []);

  return (
    <>
      <div className="container pt-5 md:pt-12">
        <h1 className="heading">Thak You for Connecting With Us.</h1>
      </div>
      <SuggestBlogs data={blogs}/>
    </>
  );
}
