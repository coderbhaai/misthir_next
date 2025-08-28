import { Box, Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import Grid from '@mui/material/Grid';
import CopyRight from './CopyRight';
import ExploreDestinations from './ExploreDestinations';
import FreeDownload from './FreeDownload';
import TrustReviews from './TrustReviews';

const Footer = () => {
  return (
    <Box 
      component="footer"
      sx={{ background: 'linear-gradient(135deg, #1a3a4d 0%, #2c6b73 50%, #3ca49a 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 40, opacity: 0.9, zIndex: 0,
          // background: 'url(/wave-top.svg) repeat-x'
        }}
      />

      <Container maxWidth="xl">
        <ExploreDestinations/>
        <TrustReviews/>
        <FreeDownload/>

        <Grid container spacing={4} sx={{ py: 4, position: 'relative', zIndex: 10 }}>
          <Grid size={4}>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                mb: 2,
                color: '#aef0f4',
                fontWeight: 'medium',
                textAlign: 'center'
              }}
            >
              Hotel&Tour
            </Typography>
            <List dense>
              {['About Us', 'Best Price Guarantee', 'Careers & Culture', 'Become a Partner'].map((item) => (
                <ListItem key={item}>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ 
                      sx: { 
                        '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4 },
                        textAlign: 'center'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid size={4}>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                mb: 2,
                color: '#aef0f4',
                fontWeight: 'medium',
                textAlign: 'center'
              }}
            >
              Help
            </Typography>
            <List dense>
              {['Support', 'Terms & Conditions', 'Privacy Policy', 'Gift Cards', 'Refund Policy'].map((item) => (
                <ListItem key={item}>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ 
                      sx: { 
                        '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4 },
                        textAlign: 'center'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid size={4}>
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                mb: 2,
                color: '#aef0f4',
                fontWeight: 'medium',
                textAlign: 'center'
              }}
            >
              Hotel&Tour Locations
            </Typography>
            <List dense>
              {['Melbourne', 'Sydney', 'Chadstone', 'London', 'Singapore'].map((item) => (
                <ListItem key={item}>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ 
                      sx: { 
                        '&:hover': { textDecoration: 'underline', textUnderlineOffset: 4 },
                        textAlign: 'center'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>

      <CopyRight/>
    </Box>
  );
};

export default Footer;