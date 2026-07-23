import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Tab,
  Tabs
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SparklesIcon from "@mui/icons-material/AutoFixHighRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  navy: "#1E3A5F",
  gold: "#D4AF37",
  goldLight: "#F5E6AB",
  dark: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0"
};

const METRICAS = [
  { val: "2,500+", label: "Clientes satisfechos", icon: <PeopleAltRoundedIcon sx={{ color: PALETTE.gold }} /> },
  { val: "100%", label: "Calidad garantizada", icon: <VerifiedRoundedIcon sx={{ color: "#22C55E" }} /> },
  { val: "5.0 ★", label: "Experiencia VIP", icon: <StarRoundedIcon sx={{ color: PALETTE.gold }} /> },
  { val: "100%", label: "Atención al detalle", icon: <WorkspacePremiumRoundedIcon sx={{ color: PALETTE.navy }} /> }
];

const VALORES = [
  {
    titulo: "Nuestra Historia",
    desc: "Nacimos con una visión clara: fusionar la maestría tradicional de la barbería con un concepto de salón moderno, elegante y sofisticado. Cada detalle de nuestro espacio ha sido diseñado para ofrecerte comodidad y confort.",
    tag: "Fundación & Trayectoria"
  },
  {
    titulo: "Técnica & Perfección",
    desc: "Cuidamos cada corte y perfilado con precisión milimétrica. Nuestro equipo utiliza herramientas de nivel profesional y productos premium seleccionados para potenciar la salud y estética de tu cabello y barba.",
    tag: "Excelencia Pro"
  },
  {
    titulo: "Experiencia Personalizada",
    desc: "Creemos que la barbería no es solo un servicio, es un ritual. Disfruta de un ambiente relajante, atención respetuosa y asesoramiento personalizado para encontrar el estilo que mejor resalte tu personalidad.",
    tag: "Trato Exclusivo"
  }
];

export default function PaginaNosotrosPublico() {
  const location = useLocation();
  const isCliente = location.pathname.startsWith("/cliente");
  const [tabActiva, setTabActiva] = useState(0);

  return (
    <Box
      sx={{
        bgcolor: isCliente ? "transparent" : PALETTE.pageBg,
        minHeight: isCliente ? "auto" : "100vh",
        py: isCliente ? { xs: 2, md: 5 } : { xs: 4, md: 8 },
        position: "relative",
        overflow: "hidden",
        // Animaciones globales de estilo
        "@keyframes gradientMove": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "@keyframes floatPulse": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.02)" }
        },
        "@keyframes textShimmer": {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" }
        }
      }}
    >
      {/* Esferas de luz ambient (Fondo dinámico) */}
      <Box
        sx={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(PALETTE.gold, 0.25)} 0%, rgba(255,255,255,0) 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(PALETTE.navy, 0.15)} 0%, rgba(255,255,255,0) 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Banner Superior Flotante */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Chip
            icon={<SparklesIcon sx={{ fontSize: "14px !important", color: `${PALETTE.gold} !important` }} />}
            label="Conoce nuestra historia y filosofía"
            size="small"
            sx={{
              bgcolor: alpha(PALETTE.gold, 0.12),
              border: `1px solid ${alpha(PALETTE.gold, 0.3)}`,
              color: "#856404",
              fontWeight: 800,
              px: 1,
              py: 0.5,
              animation: "floatPulse 4s ease-in-out infinite"
            }}
          />
        </Box>

        {/* TÍTULO PRINCIPAL CON EFECTO DE LETRAS ANIMADO (SHIMMER GRADIENT) */}
        <Typography
          variant="h2"
          component="h1"
          align="center"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
            fontFamily: '"Cinzel", ui-serif, Georgia, serif',
            letterSpacing: "-0.02em",
            mb: 2,
            // Efecto Pro en las letras: Gradiente dinámico brillante
            background: `linear-gradient(120deg, ${PALETTE.navy} 0%, ${PALETTE.gold} 40%, #152a41 80%, ${PALETTE.gold} 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "textShimmer 5s linear infinite"
          }}
        >
          Nosotros — Lady Barber
        </Typography>

        {/* Subtítulo dinámico con sombra sutil */}
        <Typography
          align="center"
          sx={{
            color: PALETTE.muted,
            fontSize: { xs: "1rem", md: "1.15rem" },
            maxWidth: 760,
            mx: "auto",
            lineHeight: 1.7,
            mb: 5,
            fontWeight: 500
          }}
        >
          Donde la elegancia de la tradición se encuentra con la vanguardia del estilo. Ofrecemos un ritual de belleza y cuidado masculino/femenino de primer nivel.
        </Typography>

        {/* METRICAS / CONTADORES PRO */}
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          {METRICAS.map((m, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: alpha(PALETTE.card, 0.85),
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${alpha(PALETTE.border, 0.8)}`,
                  boxShadow: `0 10px 30px ${alpha(PALETTE.navy, 0.05)}`,
                  textAlign: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 18px 40px ${alpha(PALETTE.gold, 0.2)}`,
                    borderColor: alpha(PALETTE.gold, 0.4)
                  }
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha(PALETTE.navy, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5
                  }}
                >
                  {m.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: PALETTE.navy,
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: "-0.01em"
                  }}
                >
                  {m.val}
                </Typography>
                <Typography variant="body2" sx={{ color: PALETTE.muted, fontWeight: 700, mt: 0.5 }}>
                  {m.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* TARJETA INTERACTIVA DE VALORES Y HISTORIA */}
        <Box
          sx={{
            borderRadius: 4,
            bgcolor: PALETTE.card,
            border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
            boxShadow: `0 20px 60px ${alpha(PALETTE.navy, 0.08)}`,
            overflow: "hidden",
            mb: 5
          }}
        >
          {/* Header con gradiente dorado */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              background: `linear-gradient(135deg, ${PALETTE.navy} 0%, #152a41 60%, ${PALETTE.dark} 100%)`,
              color: "#FFFFFF",
              position: "relative"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ContentCutIcon sx={{ color: PALETTE.gold, fontSize: 28 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontFamily: '"Cinzel", serif',
                  // Gradiente dorado en subtítulo
                  background: `linear-gradient(90deg, #FFF 0%, ${PALETTE.goldLight} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Nuestra Esencia & Compromiso
              </Typography>
            </Stack>
            <Typography sx={{ color: alpha("#FFF", 0.8), fontSize: "0.95rem", maxWidth: 700, lineHeight: 1.6 }}>
              Cuidamos cada detalle desde que entras a nuestras instalaciones hasta el acabado final. Tu satisfacción y estilo son nuestra mayor prioridad.
            </Typography>

            {/* Selector de pestañas dinámico */}
            <Tabs
              value={tabActiva}
              onChange={(_, v) => setTabActiva(v)}
              sx={{
                mt: 3,
                minHeight: 40,
                "& .MuiTab-root": {
                  color: alpha("#FFF", 0.7),
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  py: 1,
                  px: 2.5,
                  borderRadius: 2,
                  mr: 1,
                  transition: "all 0.2s ease"
                },
                "& .Mui-selected": {
                  color: `${PALETTE.gold} !important`,
                  bgcolor: alpha(PALETTE.gold, 0.15)
                },
                "& .MuiTabs-indicator": {
                  bgcolor: PALETTE.gold,
                  height: 3,
                  borderRadius: 2
                }
              }}
            >
              {VALORES.map((val, idx) => (
                <Tab key={idx} label={val.titulo} />
              ))}
            </Tabs>
          </Box>

          {/* Contenido de la pestaña activa con animación de entrada */}
          <Box sx={{ p: { xs: 3, md: 4 }, animation: "fadeIn 0.4s ease" }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Chip
                label={VALORES[tabActiva].tag}
                size="small"
                sx={{
                  bgcolor: alpha(PALETTE.gold, 0.15),
                  color: "#856404",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  border: `1px solid ${alpha(PALETTE.gold, 0.3)}`
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 900, color: PALETTE.navy, fontFamily: '"Cinzel", serif' }}>
                {VALORES[tabActiva].titulo}
              </Typography>
            </Stack>

            <Typography sx={{ color: PALETTE.muted, fontSize: "1rem", lineHeight: 1.8, mb: 3 }}>
              {VALORES[tabActiva].desc}
            </Typography>

            <Grid container spacing={2}>
              {["Atención cálida & personalizada", "Higiene y esterilización garantizada", "Puntualidad estricta en tus citas", "Productos profesionales de alta gama"].map((item, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VerifiedRoundedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.9rem" }}>
                      {item}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Botón de acción */}
        <Box sx={{ textAlign: "center" }}>
          <Button
            component={RouterLink}
            to={isCliente ? "/cliente" : "/"}
            variant="contained"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              bgcolor: PALETTE.navy,
              color: "#FFFFFF",
              textTransform: "none",
              borderRadius: "12px",
              fontWeight: 800,
              px: 4,
              py: 1.25,
              boxShadow: `0 8px 24px ${alpha(PALETTE.navy, 0.2)}`,
              "&:hover": {
                bgcolor: "#152a41",
                boxShadow: `0 12px 32px ${alpha(PALETTE.navy, 0.3)}`
              }
            }}
          >
            Volver al inicio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
