import { Box, Container, IconButton, Link, Typography, Stack } from '@mui/material';
import { 
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube
} from '@mui/icons-material';

export default function CopyRight() {
  const socialLinks = [
    { icon: <Facebook />, url: "https://facebook.com/yourpage" },
    { icon: <Twitter />, url: "https://twitter.com/yourhandle" },
    { icon: <Instagram />, url: "https://instagram.com/yourprofile" },
    { icon: <LinkedIn />, url: "https://linkedin.com/company/yourcompany" },
    { icon: <YouTube />, url: "https://youtube.com/yourchannel" }
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'rgba(200, 237, 240, 0.8)',
        fontSize: '0.75rem',
        position: 'relative',
        zIndex: 10,
        gap: 2
      }}
    >
      <Typography variant="caption">© {new Date().getFullYear()}{' '}
      <a href="https://www.amitkk.com/" target="_blank" rel="noopener noreferrer" 
        style={{ color: '#b6eef3', textDecoration: 'underline' }}>
        AMITKK
      </a>
      . All rights reserved.
    </Typography>

      <Stack direction="row" spacing={1}>
        {socialLinks.map((social, index) => (
          <IconButton
            key={index}
            component={Link}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: 'rgba(200, 237, 240, 0.8)',
              '&:hover': { 
                color: 'white',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease',
              p: 0.5
            }}
            size="small"
          >
            {social.icon}
          </IconButton>
        ))}
      </Stack>
    </Container>
  );
}