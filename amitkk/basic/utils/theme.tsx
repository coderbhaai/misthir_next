import {createTheme} from '@mui/material/styles';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
  typography: {
    h1: {
      fontSize: '3rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem'
      },
      '@media (min-width:960px)': {
        // Use media query instead of theme.breakpoints
        fontSize: '2rem'
      }
    },
    h2: {
      fontSize: '1.2rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem'
      },
      '@media (min-width:960px)': {
        fontSize: '2rem'
      }
    },
    h3: {
      fontSize: '1.2rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem'
      },
      '@media (min-width:960px)': {
        fontSize: '2rem'
      }
    },
    h4: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1rem'
      },
      '@media (min-width:960px)': {
        fontSize: '1.2rem',
        fontWeight: 400
      }
    },
    body1: {
      fontSize: '0.8rem',
      lineHeight: '2em',
      textAlign: 'justify',
      '@media (min-width:600px)': {
        fontSize: '0.9rem'
      },
      '@media (min-width:960px)': {
        fontSize: '1rem'
      }
    }
  }
});

export default theme;
