"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#1d1c18",
    },
    secondary: {
      main: "#8a6f43",
    },
    background: {
      default: "#f7f5ef",
      paper: "#ffffff",
    },
    text: {
      primary: "#1d1c18",
      secondary: "#69645a",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-acherus), var(--font-arial), Arial, sans-serif",
    h1: { fontWeight: 700, letterSpacing: 0 },
    h2: { fontWeight: 700, letterSpacing: 0 },
    h3: { fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
