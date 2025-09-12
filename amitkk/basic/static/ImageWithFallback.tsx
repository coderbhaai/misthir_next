import { Box, CardMedia, Typography } from '@mui/material';
import Image from 'next/image';
import { ImageWithFallbackProps } from '../types/page';

export default function ImageWithFallback({ img, width = "100%", height = "auto" }: ImageWithFallbackProps) {
  console.log('img', img)

  return (
    <CardMedia sx={{ width, height, position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {img ? (
          <Image src={img?.path} alt={img?.alt || "Image"} fill
            sizes="(max-width: 600px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}/>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0' }}>
            <Typography variant="subtitle2" color="text.secondary">No Image</Typography>
          </Box>
        )}
      </Box>
    </CardMedia>
  );
}
