import { GetServerSideProps } from "next";
import Link from "next/link";
import { Box, Typography, Button, Stack, Container } from "@mui/material";
import SocialMedia from "@amitkk/basic/static/SocialMedia";
import { cleanUrl, cleanBaseUrl } from "@amitkk/basic/utils/utils";
import connectDB from "pages/lib/mongodb";
import Blog from "lib/models/blog/Blog";
import Page from "lib/models/basic/Page";
import { Types } from "mongoose";

export const linkButtonStyles = {
  fontSize: 14,
  textTransform: "none",
  padding: 0,
  minWidth: "auto",
  color: "black",
  backgroundColor: "transparent",
  "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
};

interface BlogDoc {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
}

interface PageDoc {
  _id: string | Types.ObjectId;
  name: string;
  url: string;
}

export default function SiteMapPage({ blogs, pages }: { blogs: any[]; pages: any[] }) {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
        SITEMAP
      </Typography>

      {/* Pages Section */}
      <Box textAlign="left" sx={{ mb: 1 }}>
        <Typography sx={{ ...linkButtonStyles, fontWeight: "600" }}>AMITKK</Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="left" alignItems="center" sx={{ mb: 4 }}>
        {pages?.map((i, index) => (
          <Box key={`pages-${i._id}-${index}`} sx={{ display: "inline-flex", alignItems: "center" }}>
            <Button variant="text" href={i.url} component={Link} sx={linkButtonStyles}>
              {i.name}
            </Button>
            {index !== pages?.length - 1 && (
              <Typography sx={{ mx: 2, userSelect: "none", lineHeight: 1, fontSize: 28 }}>| </Typography>
            )}
          </Box>
        ))}
      </Stack>

      {/* Blogs Section */}
      <Box textAlign="left" sx={{ mb: 1 }}>
        <Link href="/blogs" passHref>
          <Typography sx={{ ...linkButtonStyles, fontWeight: "600" }}>Blogs</Typography>
        </Link>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="left" alignItems="center" sx={{ mb: 4 }}>
        {blogs?.map((i, index) => (
          <Box key={`blogs-${i._id}-${index}`} sx={{ display: "inline-flex", alignItems: "center" }}>
            <Button variant="text" href={i.url} component={Link} sx={linkButtonStyles}>
              {i.name}
            </Button>
            {index !== blogs?.length - 1 && (
              <Typography sx={{ mx: 2, userSelect: "none", lineHeight: 1, fontSize: 28 }}>| </Typography>
            )}
          </Box>
        ))}
      </Stack>

      {/* Social Media */}
      <Box textAlign="left" sx={{ mb: 1, mt: 2 }}>
        <Typography sx={{ fontSize: 20, fontWeight: "600" }}>Social Media pages</Typography>
      </Box>
      <SocialMedia />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  await connectDB();
  const blogs = (await Blog.find({}, "url name").lean()) as unknown as BlogDoc[];
  const pages = (await Page.find({}, "url name").lean()) as unknown as PageDoc[];

  return {
    props: {
      blogs: blogs?.map((b) => ({ _id: b._id.toString(), name: b.name, url: `/blog/${cleanUrl(b.url)}` })),
      pages: pages?.map((p) => ({ _id: p._id.toString(), name: p.name, url: cleanUrl(p.url) })),
    },
  };
};
