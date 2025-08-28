import { Phone, KeyboardArrowDown } from '@mui/icons-material';
import { Box, Typography, Divider, Stack } from '@mui/material';

export default function TopBar() {
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.875rem', // text-sm
        px: 2,
        py: 0.5,
        color: '#555'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">Google 4.7/5</Typography>
        <Divider orientation="vertical" flexItem sx={{ bgcolor: '#555', height: 14 }} />
        <Typography variant="body2">Trustpilot 4.8/5</Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ cursor: 'pointer' }}>
        <Typography variant="body2">Contact us 7 days</Typography>
        <Phone fontSize="small" sx={{ fontSize: '0.75rem' }} />
        <Typography variant="body2" fontWeight="medium">+91 803 783 5334</Typography>
        <KeyboardArrowDown fontSize="small" />
      </Stack>
    </Box>
  );
}