import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import Link from "next/link";
import { SingleBlogProps } from "@amitkk/blog/types/blog";

export function BlogListItem({ blog }: { blog: SingleBlogProps }) {
  return (
    <Card sx={{ display: "flex", alignItems: "center", boxShadow: "none"}}>
      {blog.media_id?.path && (
        <CardMedia component="img" sx={{ width: 100, height: 80, objectFit: "cover", borderRadius: "8px" }} image={blog.media_id.path} alt={blog.media_id.alt || blog.name}/>
      )}
      <CardContent sx={{ flex: 1, pl: 2 }}>
        <Link href={`/${blog.url}`} passHref><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{blog.name}</Typography></Link>
        {blog?.createdAt && (
            <Typography variant="caption" color="text.secondary">{new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", })}</Typography>
        )}
      </CardContent>
    </Card>
  );
}