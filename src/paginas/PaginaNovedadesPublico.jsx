import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Tabs,
  Tab,
  Collapse
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SparklesIcon from "@mui/icons-material/AutoFixHighRounded";

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

const NOVEDADES_ITEMS = [
  {
    id: 1,
    categoria: "Promociones",
    titulo: "Paquete Combo: Corte de Autor + Cuidado de Barba",
    subtitulo: "Disfruta de un tratamiento integral con exfoliación y toalla caliente.",
    fecha: "Válido este mes",
    icono: <LocalOfferRoundedIcon sx={{ color: PALETTE.gold }} />,
    tag: "PROMO ESTRELLA",
    destacado: true,
    contenido: "Al agendar tu corte de cabello premium, incluye por un costo preferencial nuestro perfilado completo de barba con masaje relajante y tratamiento de toalla caliente con aceites esenciales."
  },
  {
    id: 2,
    categoria: "Servicios Nuevos",
    titulo: "Tratamientos Capilares de Hidratación Profunda",
    subtitulo: "Recupera la vitalidad y brillo de tu cabello con productos orgánicos.",
    fecha: "Nuevo Lanzamiento",
    icono: <AutoAwesomeRoundedIcon sx={{ color: "#0EA5E9" }} />,
    tag: "NUEVO SERVICIO",
    destacado: false,
    contenido: "Incorporamos productos de última generación sin sulfatos para el cuidado intensivo del cuero cabelludo. Pregunta a nuestros estilistas por el diagnóstico capilar gratuito."
  },
  {
    id: 3,
    categoria: "Avisos",
    titulo: "Agenda de Fin de Semana & Horarios de Atención",
    subtitulo: "Reserva con anticipación para asegurar tu lugar en horarios estelares.",
    fecha: "Aviso Permanente",
    icono: <CampaignRoundedIcon sx={{ color: "#E11D48" }} />,
    tag: "AVISO IMPORTANTE",
    destacado: false,
    contenido: "Recuerda que puedes agendar tu cita 24/7 a través de nuestra plataforma online. Te sugerimos apartar con anticipación en días viernes y sábados por alta demanda."
  }
];

export default function PaginaNovedadesPublico() {
  const location = useLocation();
  const isCliente = location.pathname.startsWith("/cliente");
  const [tabFiltro, setTabFiltro] = useState("TODAS");
  const [expandidoId, setExpandidoId] = useState(null);

  const filtrados = NOVEDADES_ITEMS.filter((item) => {
    if (tabFiltro === "TODAS") return true;
    return item.categoria.toUpperCase().includes(tabFiltro);
  });

  return (
    <Box
      sx={{
        bgcolor: isCliente ? "transparent" : PALETTE.pageBg,
        minHeight: isCliente ? "auto" : "100vh",
        py: isCliente ? { xs: 2, md: 5 } : { xs: 4, md: 8 },
        position: "relative",
        overflow: "hidden",
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
          top: "-80px",
          right: "-80px",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(PALETTE.gold, 0.2)} 0%, rgba(255,255,255,0) 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(PALETTE.navy, 0.12)} 0%, rgba(255,255,255,0) 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Badge Superior Flotante */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Chip
            icon={<SparklesIcon sx={{ fontSize: "14px !important", color: `${PALETTE.gold} !important` }} />}
            label="Promociones & Anuncios Exclusivos"
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
            background: `linear-gradient(120deg, ${PALETTE.navy} 0%, ${PALETTE.gold} 40%, #152a41 80%, ${PALETTE.gold} 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "textShimmer 5s linear infinite"
          }}
        >
          Novedades & Promociones
        </Typography>

        <Typography
          align="center"
          sx={{
            color: PALETTE.muted,
            fontSize: { xs: "1rem", md: "1.15rem" },
            maxWidth: 760,
            mx: "auto",
            lineHeight: 1.7,
            mb: 4,
            fontWeight: 500
          }}
        >
          Mantente informado de nuestros paquetes especiales, eventos de temporada y las mejores sugerencias de estilo en el salón.
        </Typography>

        {/* Selector de Filtros Interactivo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <Tabs
            value={tabFiltro}
            onChange={(_, val) => setTabFiltro(val)}
            sx={{
              bgcolor: alpha(PALETTE.navy, 0.04),
              p: 0.75,
              borderRadius: 3,
              border: `1px solid ${alpha(PALETTE.navy, 0.1)}`,
              "& .MuiTab-root": {
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
                py: 0.75,
                minHeight: 36,
                color: PALETTE.muted,
                transition: "all 0.25s ease"
              },
              "& .Mui-selected": {
                bgcolor: PALETTE.navy,
                color: "#FFFFFF !important",
                boxShadow: `0 4px 12px ${alpha(PALETTE.navy, 0.25)}`
              },
              "& .MuiTabs-indicator": { display: "none" }
            }}
          >
            <Tab label="Todas" value="TODAS" />
            <Tab label="Promociones" value="PROMOCIONES" />
            <Tab label="Servicios" value="SERVICIOS" />
            <Tab label="Avisos" value="AVISOS" />
          </Tabs>
        </Box>

        {/* GRID DE NOVEDADES CON EFECTO PRO */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filtrados.map((item) => {
            const isOpen = expandidoId === item.id;

            return (
              <Grid item xs={12} md={4} key={item.id}>
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: 3.5,
                    bgcolor: PALETTE.card,
                    border: `1px solid ${item.destacado ? alpha(PALETTE.gold, 0.5) : alpha(PALETTE.border, 0.9)}`,
                    boxShadow: item.destacado
                      ? `0 12px 36px ${alpha(PALETTE.gold, 0.18)}`
                      : `0 10px 30px ${alpha(PALETTE.navy, 0.05)}`,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                    transition: "all 0.3s ease",
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: `0 20px 48px ${alpha(PALETTE.navy, 0.12)}`,
                      borderColor: alpha(PALETTE.gold, 0.6)
                    }
                  }}
                >
                  {/* Encabezado de la Tarjeta */}
                  <Box sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          bgcolor: alpha(PALETTE.navy, 0.06),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {item.icono}
                      </Box>
                      <Chip
                        label={item.tag}
                        size="small"
                        sx={{
                          bgcolor: item.destacado ? alpha(PALETTE.gold, 0.18) : alpha(PALETTE.navy, 0.08),
                          color: item.destacado ? "#856404" : PALETTE.navy,
                          fontWeight: 900,
                          fontSize: "0.68rem",
                          border: `1px solid ${item.destacado ? alpha(PALETTE.gold, 0.3) : alpha(PALETTE.navy, 0.15)}`
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: PALETTE.navy,
                        fontFamily: '"Cinzel", serif',
                        fontSize: "1.1rem",
                        lineHeight: 1.35,
                        mb: 1
                      }}
                    >
                      {item.titulo}
                    </Typography>

                    <Typography sx={{ color: PALETTE.muted, fontSize: "0.88rem", lineHeight: 1.6 }}>
                      {item.subtitulo}
                    </Typography>
                  </Box>

                  {/* Contenido desplegable interactivo */}
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 3, pb: 2, pt: 0 }}>
                      <Typography
                        sx={{
                          color: PALETTE.dark,
                          fontSize: "0.85rem",
                          lineHeight: 1.65,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(PALETTE.gold, 0.08),
                          borderLeft: `3px solid ${PALETTE.gold}`
                        }}
                      >
                        {item.contenido}
                      </Typography>
                    </Box>
                  </Collapse>

                  {/* Pie de Tarjeta */}
                  <Box
                    sx={{
                      px: 3,
                      py: 1.75,
                      borderTop: `1px solid ${alpha(PALETTE.border, 0.7)}`,
                      bgcolor: alpha(PALETTE.navy, 0.02),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: PALETTE.muted }}>
                      📅 {item.fecha}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => setExpandidoId(isOpen ? null : item.id)}
                      endIcon={
                        <ExpandMoreRoundedIcon
                          sx={{
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.25s ease"
                          }}
                        />
                      }
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        color: PALETTE.navy,
                        textTransform: "none"
                      }}
                    >
                      {isOpen ? "Menos detalles" : "Leer más"}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Botón de regreso */}
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
