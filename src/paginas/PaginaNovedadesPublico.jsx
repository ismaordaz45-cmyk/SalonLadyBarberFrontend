import React from "react";
import { Box, Container, Typography, Button, Card, CardContent, Grid, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  accent: "#FACC15",
  primary: "#1E293B"
};

function PaginaNovedadesPublico() {
  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        "@keyframes slb-riseIn": {
          "0%": { opacity: 0, transform: "translateY(14px) scale(0.992)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        }
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: PALETTE.text, mb: 2 }}>
          Novedades
        </Typography>
        <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 3, maxWidth: 720 }}>
          Aquí publicamos promociones, paquetes de temporada, horarios especiales y avisos importantes.
          Mantente al día para aprovechar descuentos y enterarte de eventos.
        </Typography>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
            overflow: "hidden",
            animation: "slb-riseIn 700ms cubic-bezier(0.2,0.8,0.2,1) both"
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 2, md: 2.5 },
              background:
                "radial-gradient(1000px 320px at 20% 0%, rgba(250, 204, 21, 0.26) 0%, rgba(250,204,21,0) 55%), radial-gradient(900px 320px at 90% 60%, rgba(30, 41, 59, 0.10) 0%, rgba(30,41,59,0) 60%)"
            }}
          >
            <Typography sx={{ fontWeight: 800, color: PALETTE.text, letterSpacing: "0.01em" }}>
              Lo que vas a encontrar aquí
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
              {["Promociones", "Paquetes", "Eventos", "Horarios especiales", "Avisos"].map((v) => (
                <Chip
                  key={v}
                  label={v}
                  size="small"
                  sx={{
                    bgcolor: "rgba(250, 204, 21, 0.20)",
                    border: "1px solid rgba(250, 204, 21, 0.36)",
                    color: PALETTE.text,
                    fontWeight: 600
                  }}
                />
              ))}
            </Box>
          </Box>

          <CardContent sx={{ px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 } }}>
            <Grid container spacing={2.25}>
              {[
                {
                  title: "Promos de temporada",
                  body: "Descuentos por fechas especiales y combos pensados para que aproveches más por menos."
                },
                {
                  title: "Paquetes recomendados",
                  body: "Sugerencias según tu estilo: corte + barba, tratamientos, color y retoques."
                },
                {
                  title: "Eventos y citas",
                  body: "Avisos de alta demanda, agenda extendida o cupos limitados para días específicos."
                }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 2.5,
                      border: `1px solid ${PALETTE.border}`,
                      p: 2.25,
                      boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                      transform: "translateY(0)",
                      transition: "transform 220ms ease, box-shadow 220ms ease",
                      animation: "slb-riseIn 700ms cubic-bezier(0.2,0.8,0.2,1) both",
                      animationDelay: `${idx * 80}ms`,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 56px rgba(15, 23, 42, 0.14)"
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 0.8 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                      {item.body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Button component={RouterLink} to="/" variant="contained" sx={{ bgcolor: PALETTE.primary, textTransform: "none", borderRadius: "12px" }}>
          Volver al inicio
        </Button>
      </Container>
    </Box>
  );
}

export default PaginaNovedadesPublico;
