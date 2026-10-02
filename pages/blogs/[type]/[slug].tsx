import React from "react";
import { GetServerSideProps } from "next";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import SingleBlogItem from "@amitkk/blog/static/single-blog-item";
import { usePaginatedData } from "hooks/usePaginatedData";
import { useSearchFilter } from "hooks/useSearchFilter";
import SearchInput from "@amitkk/basic/utils/filters/SearchInput";
import { serverApiRequest, resolveMeta } from "@amitkk/basic/utils/my-utils/client-utils";
import { MetaProps, SingleBlogProps } from "@amitkk/basic/types/shared";

interface BlogListingProps {
  blogs: SingleBlogProps[];
  type: string;
  slug: string;
  heading: string;
  blogmeta?: any;
  fetchConfig: {
    basePath: string;
    functionName: string;
    limit: number;
    params: Record<string, string>;
  };
  meta: MetaProps;
}

export default function BlogListingPage({
  blogs: initialData,
  type,
  heading,
  fetchConfig,
}: BlogListingProps) {

  const fetchMore = async (page: number) => {
    const query = new URLSearchParams({
      function: fetchConfig.functionName,
      page: String(page),
      limit: String(fetchConfig.limit),
      ...fetchConfig.params,
    });

    return await apiRequest("GET", `${fetchConfig.basePath}?${query.toString()}`);
  };

  const { data } = usePaginatedData({ initialData, fetchMore });

  const isCategory = type === "category";
  const titlePrefix = isCategory ? "Category" : "Tag";

  const { searchQuery, setSearchQuery, filteredData } = useSearchFilter(data);

  return (
    <div className="container py-5 md:py-12">
      <h1 className="heading">{heading}</h1>
      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search Blogs..."/>
      
      <div className="row">
        {filteredData?.length ? (
          filteredData.map((i: SingleBlogProps) => (
            <div key={i._id} className="col-span-12 md:col-span-3">
              <SingleBlogItem row={i} />
            </div>
          ))
        ) : (
          <h2 className="py-5 text-center">No blogs found for this {titlePrefix.toLowerCase()}.</h2>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const type = params?.type as string;
  const slug = params?.slug as string;

  if (type !== "category" && type !== "tag") {
    return {
     notFound: true,
    };
  }

  const limit = 10;

  try {
    const apiRes = await serverApiRequest( req, "GET", `blog/blogs?function=get_blogs_by_meta&meta_type=${type}&meta_url=${slug}&page=1&limit=${limit}` );
    if (!apiRes) return { notFound: true };

    const blogs = apiRes?.data || [];
    const blogmeta = apiRes?.blogmeta || null;

    const heading = blogmeta ? `Blogs of ${blogmeta.type} ${blogmeta.name}` : `Blogs`;

    const meta = resolveMeta(blogmeta.meta_id);

    return {
      props: {
        blogs,
        type,
        slug,
        blogmeta,
        heading,
        meta,
        fetchConfig: {
          basePath: "blog/blogs",
          functionName: "get_blogs_by_meta",
          limit,
          params: {
            meta_type: type,
            meta_url: slug,
          },
        },
      },
    };
  } catch (error) {
    return { notFound: true };
  }
};