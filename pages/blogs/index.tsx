import React from "react";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import SingleBlogItem from "@amitkk/blog/static/single-blog-item";
import { GetServerSideProps } from "next";
import { usePaginatedData } from "hooks/usePaginatedData";
import { useSearchFilter } from "hooks/useSearchFilter";
import SearchInput from "@amitkk/basic/utils/filters/SearchInput";
import { serverApiRequest, resolveMeta } from "@amitkk/basic/utils/my-utils/client-utils";
import type { SingleBlogProps } from "@amitkk/basic/types/shared";

interface Props {
  blogs: SingleBlogProps[];
  fetchConfig: {
    basePath: string;
    functionName: string;
    limit: number;
  };
  meta: {
    title: string;
    description: string;
  };
}

export default function BlogPage({ blogs: initialData, fetchConfig }: Props) {
  const fetchMore = async (pageRow: number) => {
    const query = new URLSearchParams({
      function: fetchConfig.functionName,
      pageRow: String(pageRow),
      limit: String(fetchConfig.limit),
    });

   return await apiRequest( "GET", `${fetchConfig.basePath}?${query.toString()}`);
  };

  const { data } = usePaginatedData({ initialData, fetchMore });
  const { searchQuery, setSearchQuery, filteredData } = useSearchFilter(data);

  return (
      <div className="container py-5 md:py-12">
        <h1 className="heading">Interesting Reads</h1>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search Blogs..."/>

          <div className="row">
            {filteredData?.map((i: SingleBlogProps) => (
              <div className="col-span-6 md:col-span-3 mb-3 md: mb-5" key={String(i._id)}>
                <SingleBlogItem row={i} />
              </div>
            ))}
          </div>
      </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const limit = 20;
  const apiRes = await serverApiRequest(req, "GET", `blog/blogs?function=get_blogs&pageRow=1&limit=${limit}`);
  if (!apiRes) return { notFound: true };

  const meta = resolveMeta(apiRes?.page?.meta_id)

  return {
    props: {
      blogs: apiRes.data || [],
      fetchConfig: {
        basePath: "blog/blogs",
        functionName: "get_blogs",
        limit,
      },
      meta,
    },
  };
};