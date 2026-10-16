import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Card, CardContent, Button, Grid, Stack, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VerifiedIcon from "@mui/icons-material/Verified";
import axios from "axios";

const API_URL = "https://salonladybarberbackend.onrender.com";

const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  navy: "#1E3A5F",
  gold: "#D4AF37",
  dark: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0"
};

export default function PaginaMisionVisionPublico({ tipo = "mision" }) {
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/perfil-empresa`);
        setEmpresa(data);
      } catch (err) {
        // Fallback silencioso
      }
    };
    fetchEmpresa();
  }, []);

  const misionTexto = empresa?.mision || "Brindar una experiencia integral de cuidado y estilismo personal de excelencia, fusionando la maestría tradicional de la barbería con las tendencias de salón más sofisticadas. Nos dedicamos a resaltar la mejor versión y autenticidad de cada cliente a través de un servicio cálido, personalizado, higiénico y con productos de la más alta calidad profesional.";

  const visionTexto = empresa?.vision || "Consolidarnos como el salón y barbería de referencia preferido en la región, reconocidos por la excelencia técnica de nuestro equipo, la constante innovación en nuestros servicios y la creación de un espacio donde cada cliente viva un auténtico ritual de bienestar, elegancia y confianza.";

  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: PALETTE.muted,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: PALETTE.navy, bgcolor: "transparent" }
            }}
          >
            Volver al inicio
          </Button>
        </Box>

        {/* Título de la sección */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            icon={<WorkspacePremiumIcon sx={{ fontSize: "16px !important", color: `${PALETTE.gold} !important` }} />}
            label="Filosofía Institucional"
            sx={{
              bgcolor: alpha(PALETTE.gold, 0.15),
              color: "#856404",
              fontWeight: 800,
              mb: 1.5,
              border: `1px solid ${alpha(PALETTE.gold, 0.3)}`
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              color: PALETTE.navy,
              fontFamily: '"Cinzel", serif',
              fontSize: { xs: "2rem", md: "2.8rem" }
            }}
          >
            Misión, Visión y Valores
          </Typography>
          <Typography sx={{ color: PALETTE.muted, mt: 1, maxWidth: 650, mx: "auto", fontSize: "1.05rem" }}>
            Los pilares estratégicos y la pasión que guían cada uno de nuestros servicios en Lady Barber ID'M.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Tarjeta de Misión */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                bgcolor: PALETTE.card,
                border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(PALETTE.navy, 0.06)}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 22px 50px ${alpha(PALETTE.navy, 0.12)}`
                }
              }}
            >
              <Box
                sx={{
                  p: 3,
                  bgcolor: PALETTE.navy,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(PALETTE.gold, 0.2),
                    color: PALETTE.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FlagOutlinedIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Cinzel", serif' }}>
                    Nuestra Misión
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha("#FFFFFF", 0.75) }}>
                    Nuestra razón de ser cada día
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography sx={{ color: PALETTE.muted, fontSize: "1.05rem", lineHeight: 1.85, mb: 3 }}>
                  {misionTexto}
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.92rem" }}>
                      Enfoque en la satisfacción y comodidad del cliente
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.92rem" }}>
                      Productos y estándares higiénicos de nivel premium
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjeta de Visión */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                bgcolor: PALETTE.card,
                border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(PALETTE.navy, 0.06)}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 22px 50px ${alpha(PALETTE.navy, 0.12)}`
                }
              }}
            >
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#152A41",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(PALETTE.gold, 0.2),
                    color: PALETTE.gold,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Cinzel", serif' }}>
                    Nuestra Visión
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha("#FFFFFF", 0.75) }}>
                    Hacia dónde nos dirigimos
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography sx={{ color: PALETTE.muted, fontSize: "1.05rem", lineHeight: 1.85, mb: 3 }}>
                  {visionTexto}
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.92rem" }}>
                      Liderazgo y preferencia en el sector de belleza y barbería
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.92rem" }}>
                      Innovación tecnológica continua (agenda web, app y asistentes)
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sección de Valores */}
        <Box sx={{ mt: 6, p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: alpha(PALETTE.navy, 0.04), border: `1px solid ${PALETTE.border}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <DiamondOutlinedIcon sx={{ color: PALETTE.gold, fontSize: 30 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: PALETTE.navy, fontFamily: '"Cinzel", serif' }}>
              Valores que nos Definen
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              { titulo: "Excelencia", desc: "Perfección en el corte, perfilado y trato a cada persona." },
              { titulo: "Puntualidad", desc: "Respeto total por tu tiempo mediante reservaciones organizadas." },
              { titulo: "Higiene y Salud", desc: "Procesos continuos de desinfección y cuidado capilar profesional." },
              { titulo: "Calidez Humana", desc: "Un ambiente acogedor donde te sientas en confianza y bienvenido siempre." }
            ].map((v, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{ p: 2.5, bgcolor: "#FFFFFF", borderRadius: 3, border: `1px solid ${PALETTE.border}`, height: "100%" }}>
                  <Typography sx={{ fontWeight: 800, color: PALETTE.navy, mb: 0.8 }}>
                    {v.titulo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: PALETTE.muted, lineHeight: 1.6 }}>
                    {v.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
