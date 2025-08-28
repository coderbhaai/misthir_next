import { SinglePageItem } from "@amitkk/basic/static/SinglePageItem";
import { PageItemProps } from "@amitkk/basic/types/page";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { BlogListItem } from "@amitkk/blog/static/BlogListItem";
import { SingleBlogProps } from "@amitkk/blog/types/blog";
import { Grid, Typography, Box } from "@mui/material";
import { getCookie } from "hooks/CookieHook";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useState } from "react";

interface SearchApiResponse {
  blogs?: SingleBlogProps[];
  pages?: PageItemProps[];
}

export default function Home() {
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
          const res: { data: SearchApiResponse } = await apiRequest("post", `basic/page`, { function: "get_search_results", term });
          setBlogs(res?.data?.blogs || []);
          setPage(res?.data?.pages || []);
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [term]);

  return (
    <Grid container spacing={4} sx={{ px:2, py:4, width:"85vw",mx:"auto"}} gap={4} >
      <Grid size={12}>
        <Typography variant="h2" fontWeight={600} sx={{ textAlign: 'center', width: '100%' }}>You searched for {term}</Typography>
      </Grid>

      {pages.length > 0 && (
        <Grid size={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Related pages</Typography>
          <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }}/>
          {pages?.map((i) => ( <SinglePageItem i={i}/> ))}
        </Grid>
      )}

      {blogs.length > 0 && (
        <Grid size={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Related Blogs</Typography>
          <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }}/>
          {blogs?.map((blog) => ( <BlogListItem key={blog._id} blog={blog}/> ))}
        </Grid>
      )}
      </Grid>
  );
}
