import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const PALETTE = {
  pageBg: "#F1F5F9",
  text: "#1E293B",
  textMuted: "#64748B",
  primary: "#1E293B"
};

function PaginaNovedadesPublico() {
  return (
    <Box sx={{ bgcolor: PALETTE.pageBg, minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: PALETTE.text, mb: 2 }}>
          Novedades
        </Typography>
        <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 3 }}>
          Próximamente publicaremos promociones, eventos y noticias del salón. Vuelve pronto o contáctanos
          para más información.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ bgcolor: PALETTE.primary, textTransform: "none", borderRadius: "12px" }}>
          Volver al inicio
        </Button>
      </Container>
    </Box>
  );
}

export default PaginaNovedadesPublico;
