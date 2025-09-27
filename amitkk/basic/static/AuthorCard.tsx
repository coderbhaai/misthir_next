import { AuthorProps } from "@amitkk/blog/types/blog";
import { Box,Grid,Typography } from "@mui/material";

export default function AuthorCard({ row }: { row?: Partial<AuthorProps> | string; }) {

  if ( !row || typeof row === "string" ) return null;

  const imagePath = (row?.media_id as any)?.path || "/default.jpg";
  const imageAlt = (row?.media_id as any)?.alt || "Inspiration Image";
  return(
    <Grid>
      <Box display="flex" gap={4}>
        <img src={imagePath} alt={imageAlt} style={{ width: 150, height: 120, borderRadius: "8px" }}/>
        <Box>
          <Typography variant="h6" mt={3}><strong>Author: {row?.name}</strong></Typography>
          <div dangerouslySetInnerHTML={{ __html: row?.content || "" }} />
        </Box>
      </Box>
    </Grid>
  );
}