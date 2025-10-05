import { GetServerSideProps } from "next";
import { apiRequest, get404Url } from "@amitkk/basic/utils/utils";
import { SingleBlogItem } from "@amitkk/blog/static/single-blog-item";
import { SingleBlogProps } from "@amitkk/blog/types/blog";
import { Box, Container, Typography, Grid } from "@mui/material";

interface BlogMeta {
  _id: string;
  type: string;
  name: string;
  url: string;
}

interface BlogListingProps {
  blogs: SingleBlogProps[];
  type: string;
  slug: string;
  heading: string;
  blogmeta?: BlogMeta | null;
}

export default function BlogListingPage({ blogs, type, slug, blogmeta, heading }: BlogListingProps) {
  const isCategory = type === "category";
  const titlePrefix = isCategory ? "Category" : "Tag";
  const displayName = blogmeta?.name || slug.replace(/-/g, " ");

  return (
    <>
      <Box sx={{ py: 5 }}>
        <Typography variant="h1" sx={{ textAlign: "center" }}>{heading}</Typography>
      </Box>

      <Container sx={{ py: 5 }}>
        <Grid container spacing={3}>
          {blogs?.length ? (
            blogs.map((i) => (
              <SingleBlogItem key={i._id.toString()} row={i}/>
            ))
          ) : (
            <Typography variant="h2" sx={{ textAlign: "center", width: "100%", py: 5 }}>No blogs found for this {titlePrefix.toLowerCase()}.</Typography>
          )}
        </Grid>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const type = params?.type as string;
  const slug = params?.slug as string;
  const redirectUrl =  get404Url();

  if (type !== "category" && type !== "tag") { return { redirect: { destination: redirectUrl, permanent: false } }; }

  try {
    const res = await apiRequest("post", "blog/blogs", { function: "get_blogs_by_meta", meta_type: type, meta_url: slug });

    const blogs = res?.data || [];
    const blogmeta = res?.blogmeta || null;

    if (!blogmeta) {
      return { redirect: { destination: redirectUrl, permanent: false } };
    }

    const heading = `Blogs of ${blogmeta.type} ${blogmeta.name}`;

    return { props: { blogs, type, slug, blogmeta, heading } };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { notFound: true };

    // return { redirect: { destination: redirectUrl, permanent: false } };
  }
};