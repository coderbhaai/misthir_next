import { 
  Facebook, 
  Instagram, 
  LinkedIn, 
  CreditCard, 
  Star, 
  Apple, 
  Android 
} from '@mui/icons-material';
import { 
  Box, 
  Button, 
  Container, 
  Divider, 
  IconButton, 
  Stack, 
  Typography 
} from '@mui/material';
import Image from 'next/image';

export default function FreeDownload() {
  return (
    <Container
      component="div"
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
        zIndex: 10,
        position: 'relative',
        bgcolor: 'background.paper'
      }}
    >
      <Stack direction="row" spacing={2}>
        <IconButton>
          <Facebook sx={{ color: '#5ea2a8' }} fontSize="medium" />
        </IconButton>
        <IconButton size="small">
          <Instagram sx={{ color: '#5ea2a8' }} fontSize="medium" />
        </IconButton>
        <IconButton size="small">
          <LinkedIn sx={{ color: '#5ea2a8' }} fontSize="medium" />
        </IconButton>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          startIcon={<Apple />}
          sx={{
            bgcolor: '#aef0f4',
            color: 'black',
            px: 2,
            py: 1,
            borderRadius: 4,
            boxShadow: '0px 4px 10px rgba(14, 60, 71, 0.3)',
            '&:hover': {
              bgcolor: '#c3f7fa'
            }
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" display="block" fontWeight="medium">
              Free Download
            </Typography>
            <Typography variant="body2" fontWeight="semibold">
              App Store
            </Typography>
          </Box>
        </Button>

        <Button
          variant="contained"
          startIcon={<Android />}
          sx={{
            bgcolor: '#aef0f4',
            color: 'black',
            px: 2,
            py: 1,
            borderRadius: 4,
            boxShadow: '0px 4px 10px rgba(14, 60, 71, 0.3)',
            '&:hover': {
              bgcolor: '#c3f7fa'
            }
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" display="block" fontWeight="medium">
              Free Download
            </Typography>
            <Typography variant="body2" fontWeight="semibold">
              Google Play
            </Typography>
          </Box>
        </Button>
      </Stack>

      {/* Payment Methods */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ color: '#5ea2a8' }}>
        <CreditCard fontSize="medium" />
        <CreditCard fontSize="medium" />
        <CreditCard fontSize="medium" />
        <Typography variant="body2">Netbanking available</Typography>
      </Stack>
    </Container>
  );
}