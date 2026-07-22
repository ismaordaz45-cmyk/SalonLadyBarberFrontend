import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const FONT_DISPLAY = '"Cinzel", ui-serif, Georgia, serif';
const FONT_BODY =
  '"Montserrat", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif';

let theme = createTheme({
  palette: {
    primary: {
      // Azul botón "Actualizar" (estilo Estadísticas)
      main: "#3B82F6",
      dark: "#2563EB",
      contrastText: "#FFFFFF"
    }
  },
  typography: {
    fontFamily: FONT_BODY,
    h1: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "2.2rem", lineHeight: 1.08, letterSpacing: "0.02em" },
    h2: { fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "1.8rem", lineHeight: 1.12, letterSpacing: "0.02em" },
    h3: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.16, letterSpacing: "0.02em" },
    h4: { fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.3rem", lineHeight: 1.18, letterSpacing: "0.02em" },
    h5: { fontFamily: FONT_BODY, fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.22 },
    h6: { fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.25 },

    subtitle1: { fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.88rem", lineHeight: 1.45 },
    subtitle2: { fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.78rem", lineHeight: 1.45 },

    body1: { fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.88rem", lineHeight: 1.65 },
    body2: { fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.78rem", lineHeight: 1.6 },

    button: { fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.8rem", textTransform: "none" },
    caption: { fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.7rem", lineHeight: 1.45 },
    overline: { fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 900,
          borderRadius: 12
        },
        sizeMedium: {
          minHeight: 40,
          paddingLeft: 18,
          paddingRight: 18
        },
        containedPrimary: {
          backgroundColor: "#3B82F6",
          "&:hover": { backgroundColor: "#2563EB" }
        }
      }
    }
  }
});

theme = responsiveFontSizes(theme, { factor: 2.6 });

export default theme;

