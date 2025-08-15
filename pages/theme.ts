// src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B923C", // Primary color (e.g. green)
      light: "#66bb6a",
      dark: "#2e7d32",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e4990f", // Action color (e.g. amber/golden)
      light: "#ffb74d",
      dark: "#b26a00",
      contrastText: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          backgroundColor: theme.palette.primary.main, // ✅ uses primary main
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark, // ✅ darker on hover
          },
        }),
      },
    },
  },
});

export default theme;