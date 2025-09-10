import { Box, CardMedia, Typography } from '@mui/material';
import Image from 'next/image';

type ImageObject = {
  path: string;
  alt: string;
};

type ImageWithFallbackProps = {
  img?: ImageObject | null;
  width?: number | string;
  height?: number | string;
};

export default function ImageWithFallback({ img, width = "100%", height = "auto" }: ImageWithFallbackProps) {
  return (
    <CardMedia sx={{ width, height, position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
      <Box>
        {img ? (
          <Image src={img?.path} alt={img?.alt} fill style={{ objectFit: 'cover', objectPosition: 'center' }}/>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0' }}>
            <Typography variant="subtitle2" color="text.secondary">No Image</Typography>
          </Box>
        )}
      </Box>
    </CardMedia>
  );
}
