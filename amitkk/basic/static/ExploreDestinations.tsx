import { Box, Button, Grid, Typography } from '@mui/material';

export default function ExploreDestinations() {
  const countries = [
    "Australia", "United States", "Indonesia", "Thailand", "United Kingdom", "Spain",
    "Malaysia", "Italy", "Portugal", "France", "New Zealand", "Mexico"
  ];

  return (
    <Box
      sx={{ px: 4, pt: 3, pb: 6, borderBottom: '1px solid', borderColor: 'teal.300', opacity: 0.9, position: 'relative', zIndex: 10
      ,backdropFilter: 'blur(10px)',backgroundColor: 'rgba(255,255,255,0.05)',}}
    >
      <Typography 
        variant="h4"
        sx={{
          mb: 3,
          color: '#ffffff',
          fontWeight: 'bold',
          textShadow: '0px 1px 3px rgba(0,0,0,0.5)'
        }}
      >
        Explore top hotel destinations we love
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {countries.map((country) => (
          <Grid size={2} key={country}>
            <Box sx={{ cursor: 'pointer' }}>
              <Typography 
                sx={{
                  '&:hover': { color: '#d0f4f7' },
                  transition: 'color 0.2s'
                }}
              >
                {country}
              </Typography>
              <Typography 
                variant="caption"
                sx={{
                  color: 'rgba(200, 237, 240, 0.8)',
                  '&:hover': { color: 'white' },
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                Hotels & Resorts
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        sx={{
          borderColor: '#9fdde4',
          color: '#b6eef3',
          borderRadius: '999px',
          px: 3,
          py: 1,
          '&:hover': {
            backgroundColor: 'rgba(182, 238, 243, 0.1)',
            borderColor: '#9fdde4'
          },
          transition: 'all 0.2s'
        }}
      >
        Show 69 countries
      </Button>
    </Box>
  );
}