import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const PALETTE = {
  pageBg: "#F1F5F9",
  text: "#1E293B",
  textMuted: "#64748B",
  primary: "#1E293B"
};

function PaginaNosotrosPublico() {
  return (
    <Box sx={{ bgcolor: PALETTE.pageBg, minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: PALETTE.text, mb: 2 }}>
          Nosotros
        </Typography>
        <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 3 }}>
          Lady Barber Itza D&apos;M es un espacio dedicado al cuidado del estilo y la imagen personal.
          Aquí podrás conocer nuestra historia, equipo y valores. Esta sección se ampliará con el contenido
          definitivo de tu sitio.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ bgcolor: PALETTE.primary, textTransform: "none", borderRadius: "12px" }}>
          Volver al inicio
        </Button>
      </Container>
    </Box>
  );
}

export default PaginaNosotrosPublico;
