import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminPageShell from "../ui/admin/AdminPageShell";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import VistaPreviaServiciosCliente from "../componentes/cliente/VistaPreviaServiciosCliente";
import VistaPreviaProductosInventarioCliente from "../componentes/cliente/VistaPreviaProductosInventarioCliente";

const MotionBox = motion.create(Box);

const PASOS = [
  {
    n: 1,
    titulo: "Selecciona tu servicio",
    texto: "Elige el servicio que deseas dentro del catálogo disponible."
  },
  {
    n: 2,
    titulo: "Elige fecha y hora",
    texto: "Selecciona el día y horario que mejor se adapte a tu disponibilidad."
  },
  {
    n: 3,
    titulo: "Confirma tu cita",
    texto: "Ingresa tus datos y confirma la reservación para asegurar tu lugar."
  }
];

const EVENTOS = [
  {
    key: "bodas",
    titulo: "Bodas",
    subtitulo: "Peinados y maquillaje para el día más especial.",
    imagen: "/images/evento-bodas.svg"
  },
  {
    key: "xv",
    titulo: "XV Años",
    subtitulo: "Looks memorables para celebrar tu transición con estilo.",
    imagen: "/images/evento-xv-anos.svg"
  },
  {
    key: "grad",
    titulo: "Graduaciones",
    subtitulo: "Estilos impecables para tu logro académico.",
    imagen: "/images/evento-graduaciones.svg"
  },
  {
    key: "pres",
    titulo: "Presentaciones",
    subtitulo: "Imagen cuidada para eventos formales y profesionales.",
    imagen: "/images/evento-presentaciones.svg"
  }
];

function PaginaPrincipalCliente() {
  const navigate = useNavigate();
  const [imgReady, setImgReady] = useState({
    bodas: false,
    xv: false,
    grad: false,
    pres: false
  });

  return (
    <AdminPageShell maxWidth="lg">
      <Stack spacing={4}>
        {/* 1. SERVICIOS DESTACADOS */}
        <Box>
          <VistaPreviaServiciosCliente maxItems={3} />
        </Box>

        {/* 2. PRODUCTOS DEL INVENTARIO (TIENDA) */}
        <Box>
          <VistaPreviaProductosInventarioCliente maxItems={6} />
        </Box>

        {/* 3. HAZNOS PARTE DE TI (3 Pasos interactivos) */}
        <Box
          sx={{
            py: { xs: 5, md: 7 },
            bgcolor: "#FFFFFF",
            borderRadius: 4,
            border: `1px solid ${P.border}`,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.02)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(900px 280px at 20% 10%, rgba(212, 175, 55, 0.08) 0%, rgba(212,175,55,0) 60%), radial-gradient(760px 320px at 80% 60%, rgba(30, 58, 90, 0.04) 0%, rgba(30,58,90,0) 65%)",
              pointerEvents: "none"
            }
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                variant="h4"
                sx={{
                  color: P.navy,
                  fontWeight: 900,
                  fontFamily: '"Cinzel", ui-serif, Georgia, serif',
                  fontSize: { xs: "1.8rem", md: "2.3rem" },
                  letterSpacing: "-0.01em",
                  mb: 1.5,
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "50px",
                    height: "3.5px",
                    borderRadius: "2px",
                    background: `linear-gradient(90deg, ${P.navy} 0%, ${P.accent} 100%)`
                  }
                }}
              >
                Haznos parte de ti
              </Typography>
              <Typography
                sx={{
                  color: P.secondary,
                  mt: 3,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontWeight: 700
                }}
              >
                Tu cita lista en 3 sencillos pasos.
              </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {PASOS.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.n}>
                  <MotionBox
                    whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(30, 58, 90, 0.08)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: p.n * 0.1
                    }}
                    sx={{
                      textAlign: "center",
                      p: 3.5,
                      borderRadius: 4,
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                      border: `1px solid ${P.border}`,
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.01)",
                      backdropFilter: "blur(8px)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        bgcolor: P.navy,
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                        mx: "auto",
                        mb: 2.5,
                        boxShadow: `0 6px 15px ${alpha(P.navy, 0.2)}`,
                        border: "2px solid #FFFFFF",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.08) rotate(5deg)"
                        }
                      }}
                    >
                      {p.n}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        color: P.navy,
                        fontFamily: '"Cinzel", ui-serif, Georgia, serif',
                        fontSize: "1.1rem",
                        mb: 1
                      }}
                    >
                      {p.titulo}
                    </Typography>
                    <Typography
                      sx={{
                        color: P.secondary,
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        maxWidth: "250px",
                        mx: "auto",
                        fontWeight: 650
                      }}
                    >
                      {p.texto}
                    </Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* 4. HAZNOS PARTE DE TUS EVENTOS ESPECIALES */}
        <Box
          sx={{
            py: { xs: 5, md: 7 },
            bgcolor: P.navy,
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 10px 40px ${alpha(P.navy, 0.15)}`,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(1200px 520px at 50% 0%, rgba(212, 175, 55, 0.12) 0%, rgba(212,175,55,0) 60%), radial-gradient(900px 520px at 0% 100%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 55%)",
              pointerEvents: "none"
            }
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              sx={{
                color: "#FFFFFF",
                fontWeight: 900,
                textAlign: "center",
                letterSpacing: "-0.01em",
                fontFamily: '"Cinzel", ui-serif, Georgia, serif',
                fontSize: { xs: "1.8rem", md: "2.3rem" }
              }}
            >
              Haznos parte de tus eventos especiales
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                mt: 1.5,
                mb: 4,
                textAlign: "center",
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: "0.92rem",
                fontWeight: 700
              }}
            >
              Transformamos tus momentos más importantes en recuerdos eternos con looks pensados para cada
              ocasión especial.
            </Typography>

            <Grid container spacing={3.5}>
              {EVENTOS.map((ev, index) => (
                <Grid item xs={12} sm={6} md={3} key={ev.key}>
                  <Card
                    component={motion.div}
                    whileHover={{ y: -8, borderColor: alpha(P.accent, 0.6) }}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Box sx={{ position: "relative", height: 150, overflow: "hidden" }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={ev.imagen}
                        alt={ev.titulo}
                        onLoad={() => setImgReady((s) => ({ ...s, [ev.key]: true }))}
                        sx={{
                          objectFit: "cover",
                          transform: imgReady[ev.key] ? "none" : "scale(1.04)",
                          opacity: imgReady[ev.key] ? 1 : 0,
                          transition: "transform 0.5s ease, opacity 0.5s ease",
                          bgcolor: alpha("#000000", 0.08)
                        }}
                      />
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)"
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 2.2 }}>
                      <Typography sx={{ fontWeight: 900, color: "#FFFFFF", fontSize: "0.95rem", letterSpacing: "0.01em" }}>
                        {ev.titulo}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", mt: 0.5, mb: 2, height: 38, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontWeight: 650 }}>
                        {ev.subtitulo}
                      </Typography>
                      <Button
                        onClick={() => navigate("/cliente/servicios")}
                        fullWidth
                        sx={{
                          bgcolor: P.accent,
                          color: "#1E3A5F",
                          fontWeight: 900,
                          textTransform: "none",
                          borderRadius: "10px",
                          boxShadow: `0 4px 10px ${alpha(P.accent, 0.25)}`,
                          fontSize: "0.8rem",
                          "&:hover": {
                            bgcolor: "#e5bf4c"
                          }
                        }}
                      >
                        Reservar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                onClick={() => navigate("/cliente/servicios")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: P.accent,
                  color: "#1E3A5F",
                  fontWeight: 900,
                  px: 4,
                  py: 1.25,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "0.9rem",
                  boxShadow: `0 8px 24px ${alpha(P.accent, 0.3)}`,
                  "&:hover": { bgcolor: "#e5bf4c" }
                }}
              >
                Reservar mi evento soñado
              </Button>
            </Box>
          </Container>
        </Box>
      </Stack>
    </AdminPageShell>
  );
}

export default PaginaPrincipalCliente;
