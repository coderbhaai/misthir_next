import Grid from '@mui/material/Grid';
import { Card, Typography, Box, IconButton, Chip, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Image from 'next/image';
import Link from 'next/link';
import { SingleBlogProps } from '@amitkk/blog/types/blog';

export function SingleBlogItem({ row }: { row: Partial<SingleBlogProps> }) {
    const imagePath = (row.media_id as any)?.path || "/default.jpg";
    const imageAlt = (row.media_id as any)?.alt || "Inspiration Image";
  return (
    <Grid size={4}>
        <Card sx={{ mb: 2, boxShadow: 3, position: "relative", width: '100%', height: '300px', overflow: "hidden" }}>
            <Link href={`/${row.url}`} passHref>
                <Image src={imagePath} alt={imageAlt} fill style={{ objectFit: 'cover' }}/>
            </Link>
            {/* <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", alignItems: "center", display: "flex", flexDirection: "row", justifyContent: "space-between", color: "#fff", p: 2, backgroundImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent)" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <IconButton sx={{ color: "white" }}><BookmarkBorderIcon /></IconButton>
                    <IconButton sx={{ color: "white" }}><FavoriteBorderIcon /></IconButton>
                    <IconButton sx={{ color: "white" }}><ChatBubbleOutlineIcon /></IconButton>
                </Box>
            </Box> */}

            <Box sx={{ position: "absolute", top: 0, bottom: 0, width: "100%", display: "flex", flexDirection: "column", justifyContent: "end", color: "#fff", p: 2, backgroundImage: "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)" }}>
                <Typography variant="h6" fontWeight="thin">
                    <Link href={`/${row.url}`} passHref>{row.name}</Link>
                </Typography>
            </Box>
        </Card>
    </Grid>
  );
}
