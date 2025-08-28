import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import Link from "next/link";
import { PageItemProps } from "@amitkk/basic/types/page";

export function SinglePageItem({ i }: { i: PageItemProps }) {
  const pageUrl = i.url === '/' ? '/' : `/${i.url}`;
  return (
    <Card sx={{ display: "flex", alignItems: "center", boxShadow: "none"}}>
      {i.media_id?.path && (
        <CardMedia component="img" sx={{ width: 100, height: 80, objectFit: "cover", borderRadius: "8px" }} image={i.media_id.path} alt={i.media_id.alt || i.name}/>
      )}
      <CardContent sx={{ flex: 1, pl: 2 }}>
        <Link href={pageUrl} passHref><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{i.name}</Typography></Link>
      </CardContent>
    </Card>
  );
}