import { Card, Typography, Box, Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { BlogListItem } from "@amitkk/blog/static/BlogListItem";
import { BlogMetaProps, SingleBlogProps } from "@amitkk/blog/types/blog";

export interface BlogSidebarProps {
  _id?: string;
}

interface SidebarApiResponse {
  blogs?: SingleBlogProps[];
  category?: BlogMetaProps[];
  tag?: BlogMetaProps[];
}

export function SidebarBlog({ _id }: BlogSidebarProps) {
  const [blogs, setBlogs] = useState<SingleBlogProps[]>([]);
  const [categories, setCategories] = useState<BlogMetaProps[]>([]);
  const [tags, setTags] = useState<BlogMetaProps[]>([]);

  useEffect(() => {
    if (_id) {
      const fetchSidebarData = async () => {
        try {
          const res: { data: SidebarApiResponse } = await apiRequest( "get", `blog/blogs?function=get_single_blog_sidebar&id=${_id}`);
          setBlogs(res?.data?.blogs || []);
          setCategories(res?.data?.category || []);
          setTags(res?.data?.tag || []);
        } catch (error) {
          clo(error);
        }
      };
      fetchSidebarData();
    }
  }, [_id]);

  return (
    <Grid size={3}>
      <Typography variant="h5" gutterBottom>Categories</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      {categories?.map((cat) => (
        <Box key={cat._id} sx={{ border: "1px solid black", borderRadius: "9999px", px: 2, py: 0.5, mb: 1, mr: 1, display: "inline-block", }}>
          <Link href={`/category/${cat.url}`} passHref><Typography variant="body2" textAlign="center">{cat.name}</Typography></Link>
        </Box>
      ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Tags</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }} />
      {tags?.map((tg) => (
        <Box key={tg._id} sx={{ border: "1px solid black", borderRadius: "9999px", px: 2, py: 0.5, mb: 1, mr: 1, display: "inline-block" }}>
          <Link href={`/tag/${tg.url}`} passHref><Typography variant="body2" textAlign="center">{tg.name}</Typography></Link>
        </Box>
      ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Related Blogs</Typography>
      <Box sx={{ borderBottom: "2px solid #ccc", mb: 2 }}/>
      {blogs?.map((blog) => ( <BlogListItem key={blog._id} blog={blog}/> ))}
    </Grid>
  );
}