import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import type { SingleBlogProps } from "@amitkk/basic/types/shared";
import { getCookie } from "hooks/CookieHook";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useState } from "react";
import SingleBlogItem from "@amitkk/blog/static/single-blog-item";
import { SinglePageItem } from "@amitkk/basic/static/SinglePageItem";
import { PageItemProps } from "@amitkk/basic/types";

interface SearchApiResponse {
  blogs?: SingleBlogProps[];
  pages?: PageItemProps[];
}

export default function Search () {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [blogs, setBlogs] = useState<SingleBlogProps[]>([]);
  const [pages, setPage] = useState<PageItemProps[]>([]);

  useEffect(() => {
    const handleRouteChange = () => {
      const savedSearch = getCookie("search");
      if (savedSearch) {
        setTerm(savedSearch as string);
      }
    };

    handleRouteChange();
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  React.useEffect(() => {
    if (term) {
      const fetchData = async () => {
        try {
          const res: { data: SearchApiResponse } = await apiRequest("POST", `basic/page`, { function: "get_search_results", term });
          setBlogs(res?.data?.blogs || []);
          setPage(res?.data?.pages || []);
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [term]);

  return (
    <div className="container">
      <h1 className="heading">You searched for {term}</h1>

      {pages.length > 0 && (
        <>
          <h2 className="mt-3">Related pages</h2>
          <div className="row">
            {pages?.map((i) => ( 
              <div key={String(i._id)} className="col-span-12 md:col-span-4"><SinglePageItem key={String(i._id)} i={i} /></div>
            ))}
          </div>
        </>
      )}

      {blogs.length > 0 && (
        <>
          <h2 className="mt-3">Related Blogs</h2>
          <div className="row">
            {blogs?.map((i) => ( 
              <div key={String(i._id)} className="col-span-12 md:col-span-4"><SingleBlogItem key={String(i._id)} row={i} /></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
