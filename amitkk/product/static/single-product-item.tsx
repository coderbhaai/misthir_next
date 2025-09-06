import { Grid, Typography, Box, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

interface SingleProductItemProps {
  row: Partial<SingleProductProps>;
}

export function SingleProductItem({ row }: SingleProductItemProps) {
  const hasMultipleImages = row.medias && row.medias.length > 1;
  const firstImage = row.medias?.[0]?.path || "/default.jpg";
  const secondImage = hasMultipleImages ? row.medias?.[1].path : firstImage;

  return (
    <Grid size={4}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          cursor: "pointer",
          "&:hover .hoverImage": { opacity: 1, transform: "scale(1)" },
          "&:hover .defaultImage": { opacity: 0, transform: "scale(1.05)" },
          "&:hover .hoverContent": { opacity: 1, transform: "translateY(0)" },
          "&:hover .defaultText": { opacity: 0, transform: "translateY(100%)" },
        }}>
          <Link href={`/product/${row.url}`} passHref style={{ textDecoration: "none" }}>
            <Box sx={{ position: "relative", cursor: "pointer" }}>
              <Box className="defaultImage" sx={{ position: "relative", width: "100%", height: 350, transition: "all 0.5s ease", }}>
                <Image src={firstImage} alt={row.medias?.[0]?.alt || row.name} fill style={{ objectFit: "cover" }}/>
              </Box>
              
              {hasMultipleImages && (
                <Box className="hoverImage" sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: 350, opacity: 0, transform: "scale(1.05)", transition: "all 0.5s ease", }}>
                  <Image src={secondImage} alt={row.medias?.[1]?.alt || row.name} fill style={{ objectFit: "cover" }}/>
                </Box>
              )}

              <Box className="defaultText" sx={{ position: "absolute", width: "100%", bottom: 0, left: 0, right: 0, color: "#000", p: 2, textAlign: "center", transition: "all 0.3s ease", backdropFilter: "blur(6px)", }}>
                <Typography variant="body1" sx={{ color: "#fff", textAlign:"center"}}>{row.name}</Typography>
                {row.dietary_type && <Typography variant="body2" sx={{ color: "#fff", position: "absolute", top: "5px", right: "5px", }}>{row.dietary_type}</Typography>}
              </Box>
            </Box>
          </Link>

        <Box className="hoverContent" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", justifyContent:  "center", alignItems: "center", opacity: 0, transform: "translateY(20px)", transition: "all 0.3s ease", color: "#fff", }}>
          {row.weight && ( <Typography variant="body1" sx={{ mb: 1 }}>{row.weight}</Typography> )}
          <Button variant="contained" sx={{ borderRadius: 10, px: 4 }}>Buy Now</Button>

          <Box sx={{ position: "absolute", bottom: 16 }}>
            <Link href={`/product/${row.url}`} passHref>
              <Button variant="outlined" sx={{ borderRadius: 10, px: 4, color: "#fff", borderColor: "#fff" }}>
                Check Product
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
