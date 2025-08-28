import { Box, Typography, Stack } from '@mui/material';
import Image from 'next/image';

export default function TrustReviews() {
  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'teal.300',
        opacity: 0.9,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Google Rating */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* <Box sx={{ width: 20, height: 20 }}>
          <Image 
            src="/socialicons/google-icon.svg" 
            alt="Google" 
            width={20} 
            height={20}
            style={{ objectFit: 'cover', height: '100%', width: 'auto' }}
          />
        </Box> */}
        <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'white' }}>
          4.7/5
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(200, 237, 240, 0.8)' }}>
          2.6k reviews
        </Typography>
      </Stack>

      {/* Excellent Rating */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
          'Excellent'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(200, 237, 240, 0.8)' }}>
          10K reviews
        </Typography>
      </Stack>

      {/* Trusted By */}
      <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
        <Typography variant="body2">
          Trusted by
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
          8 million members
        </Typography>
      </Box>
    </Box>
  );
}