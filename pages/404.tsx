import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import { BlogDocument } from "lib/models/blog/Blog";
import { ProductRawDocument } from "lib/models/types";
import { useEffect, useState } from "react";
import { Typography, Grid } from "@mui/material";

export default function ContactUs() {
  const [blogs, setBlogs] = useState<BlogDocument[]>([]);
  const [products, setProducts] = useState<ProductRawDocument[]>([]);

  useEffect(() => {
      const fetchSidebarData = async () => {
        try {
          const res = await apiRequest("get", "basic/page?function=get_page_static_data");
          setBlogs(res?.blogs ?? []);
          setProducts(res?.products ?? []);
        } catch (error) { clo(error); }
      };
      fetchSidebarData();
    }, []);

  return (
      <Grid container spacing={4} sx={{ px:2, py:4, width:"85vw",mx:"auto"}} gap={4} >
        <Typography variant="h4" gutterBottom>404 !!! Something bad happened</Typography>
        <SuggestProducts products={products} />
        <SuggestBlogs blogs={blogs} />
      </Grid>
  );
}
