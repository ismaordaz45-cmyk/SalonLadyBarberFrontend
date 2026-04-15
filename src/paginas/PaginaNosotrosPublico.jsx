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

function PaginaNosotrosPublico() {
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
          Nosotros
        </Typography>
        <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 3, maxWidth: 720 }}>
          Lady Barber Itza D&apos;M es un espacio dedicado al cuidado del estilo y la imagen personal.
          Combinamos la precisión de barbería con un enfoque de salón para que cada visita se sienta
          profesional, cómoda y con resultados que se notan.
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
                "radial-gradient(1000px 320px at 20% 0%, rgba(250, 204, 21, 0.30) 0%, rgba(250,204,21,0) 55%), radial-gradient(900px 320px at 90% 60%, rgba(30, 41, 59, 0.10) 0%, rgba(30,41,59,0) 60%)"
            }}
          >
            <Typography sx={{ fontWeight: 800, color: PALETTE.text, letterSpacing: "0.01em" }}>
              Nuestra esencia
            </Typography>
            <Typography sx={{ color: PALETTE.textMuted, mt: 0.8, lineHeight: 1.75 }}>
              Cuidamos los detalles: diagnóstico rápido, técnica limpia y acabados pensados para tu
              estilo de vida. Queremos que salgas con confianza, y que tu look te acompañe varios días.
            </Typography>
          </Box>

          <CardContent sx={{ px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 } }}>
            <Grid container spacing={2.25}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: 2.5,
                    border: `1px solid ${PALETTE.border}`,
                    p: 2.25,
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 56px rgba(15, 23, 42, 0.14)"
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 0.8 }}>
                    Historia
                  </Typography>
                  <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                    Nacimos con una idea simple: un lugar donde el servicio se sienta cercano y el
                    resultado sea impecable. Con el tiempo fuimos sumando técnicas, productos y una
                    atención más personalizada para cada cliente.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: 2.5,
                    border: `1px solid ${PALETTE.border}`,
                    p: 2.25,
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 56px rgba(15, 23, 42, 0.14)"
                    }
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 0.8 }}>
                    Lo que nos mueve
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.25 }}>
                    {["Atención cálida", "Higiene", "Puntualidad", "Detalle", "Calidad"].map((v) => (
                      <Chip
                        key={v}
                        label={v}
                        size="small"
                        sx={{
                          bgcolor: "rgba(250, 204, 21, 0.22)",
                          border: "1px solid rgba(250, 204, 21, 0.38)",
                          color: PALETTE.text,
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                  <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                    Trabajamos para que cada servicio sea consistente: desde el primer corte hasta el
                    último retoque. Si algo no te convence, lo ajustamos contigo.
                  </Typography>
                </Box>
              </Grid>
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

export default PaginaNosotrosPublico;
