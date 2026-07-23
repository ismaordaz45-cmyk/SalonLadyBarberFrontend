import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import BarberPole from "../componentes/compartidos/BarberPole";
import AdminPageShell from "../ui/admin/AdminPageShell";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import CarruselTePuedeInteresarCliente from "../componentes/cliente/CarruselTePuedeInteresarCliente";
import axios from "axios";
import { logoBase64ToDataUrl } from "../utils/logoDataUrl";

const MotionBox = motion.create(Box);

const IMG = `${process.env.PUBLIC_URL || ""}/images/landing`;
const API_URL = "https://salonladybarberbackend.onrender.com";

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

function PaginaPrincipalCliente() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    let cancel = false;
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/perfil-empresa`);
        if (!cancel) setPerfil(data);
      } catch {
        if (!cancel) setPerfil(null);
      }
    };
    fetchPerfil();
    return () => {
      cancel = true;
    };
  }, []);

  const heroImage = perfil?.hero_image
    ? logoBase64ToDataUrl(perfil.hero_image)
    : `${IMG}/hero-salon.jpg`;

  const heroPoleWidth = isSmUp ? 22 : 16;

  return (
    <Box sx={{ pb: 6 }}>
      {/* 1. HERO BANNER */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "360px", sm: "460px", md: "520px" },
          borderRadius: 4,
          overflow: "hidden",
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: `0 12px 40px ${alpha(P.navy, 0.15)}`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(15, 23, 42, 0.62)",
            backdropFilter: "brightness(0.85)"
          }
        }}
      >
        {/* Postes verticales de Barbería */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none"
          }}
        >
          <BarberPole
            fullHeight
            width={heroPoleWidth}
            sx={{ position: "absolute", left: 0, top: 0, bottom: 0, opacity: 0.9 }}
          />
          <BarberPole
            fullHeight
            width={heroPoleWidth}
            sx={{ position: "absolute", right: 0, top: 0, bottom: 0, opacity: 0.9 }}
          />
        </Box>

        {/* Contenido Central del Hero */}
        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            px: { xs: 3, sm: 5 },
            py: { xs: 4, md: 6 }
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "#FFFFFF",
              fontWeight: 900,
              fontFamily: '"Cinzel", ui-serif, Georgia, serif',
              fontSize: { xs: "1.6rem", sm: "2.4rem", md: "3.1rem" },
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              mb: 2,
              textShadow: "0 4px 18px rgba(0,0,0,0.6)"
            }}
          >
            ESTILO DE BARBERÍA, ACABADO DE SALÓN: CUIDADO Y PROFESIONALISMO
          </Typography>

          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.92)",
              fontSize: { xs: "0.88rem", sm: "1.05rem" },
              lineHeight: 1.6,
              maxWidth: 720,
              mx: "auto",
              mb: 4,
              fontWeight: 500,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            Cortes, barba y detalle con mentalidad de barbería; color, peinado y eventos cuando lo necesites. Todo en un solo lugar: Lady Barber.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              onClick={() => navigate("/cliente/citas")}
              startIcon={<CalendarMonthRoundedIcon />}
              sx={{
                bgcolor: "#FFFFFF",
                color: "#1E3A5F",
                fontWeight: 900,
                px: 3.5,
                py: 1.25,
                borderRadius: "12px",
                fontSize: "0.95rem",
                textTransform: "none"
              }}
            >
              Reservar Cita
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/cliente/productos")}
              startIcon={<ShoppingBagRoundedIcon />}
              sx={{
                borderColor: "#FFFFFF",
                color: "#FFFFFF",
                fontWeight: 900,
                px: 3.5,
                py: 1.25,
                borderRadius: "12px",
                fontSize: "0.95rem",
                textTransform: "none",
                bgcolor: "rgba(255,255,255,0.1)"
              }}
            >
              Ver Tienda de Productos
            </Button>
          </Stack>
        </Container>
      </Box>

      <AdminPageShell maxWidth="lg">
        <Stack spacing={4}>
          {/* 2. CARRUSEL "TE PUEDE INTERESAR" */}
          <Box>
            <CarruselTePuedeInteresarCliente />
          </Box>

          {/* 3. HAZNOS PARTE DE TI (3 Pasos) */}
          <Box
            sx={{
              py: { xs: 5, md: 7 },
              bgcolor: "#FFFFFF",
              borderRadius: 4,
              border: `1px solid ${P.border}`,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.02)"
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
                    mb: 1.5
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
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: p.n * 0.1 }}
                      sx={{
                        textAlign: "center",
                        p: 3.5,
                        borderRadius: 4,
                        bgcolor: "rgba(255, 255, 255, 0.7)",
                        border: `1px solid ${P.border}`,
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.01)"
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
                          mb: 2.5
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
                          mb: 1
                        }}
                      >
                        {p.titulo}
                      </Typography>
                      <Typography sx={{ color: P.secondary, fontSize: "0.85rem", lineHeight: 1.5 }}>
                        {p.texto}
                      </Typography>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        </Stack>
      </AdminPageShell>
    </Box>
  );
}

export default PaginaPrincipalCliente;