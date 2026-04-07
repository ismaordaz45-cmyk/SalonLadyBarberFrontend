import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

import {
  ContentCut as BarberIcon,
  FaceRetouchingNatural as BellezaIcon,
  School as ClaseIcon,
  LocalShipping as EnviosIcon,
  Verified as VerificadoIcon,
  Favorite as FavoritoIcon,
} from "@mui/icons-material";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const PaginaPrincipalRecepcion = () => {

  /*
    👉 Cuando conectes backend limpio:
    aquí solo reemplazas este estado por el fetch real.
  */
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    // Datos temporales (mock)
    setServicios([
      {
        id: 1,
        nombre: "Corte Premium",
        precio: "$299",
        imagen: "/corte-premium.jpg",
        categoria: "Barbería",
      },
      {
        id: 2,
        nombre: "Facial Importado",
        precio: "$149",
        imagen: "/facial-importado.jpg",
        categoria: "Belleza",
      },
      {
        id: 3,
        nombre: "Clase Artesanal",
        precio: "$89",
        imagen: "/clase-artesanal.jpg",
        categoria: "Clases",
      },
      {
        id: 4,
        nombre: "Estilo Vintage",
        precio: "$119",
        imagen: "/estilo-vintage.jpg",
        categoria: "Especiales",
      },
      {
        id: 5,
        nombre: "Tratamiento Gourmet",
        precio: "$349",
        imagen: "/tratamiento-gourmet.jpg",
        categoria: "Belleza",
      },
      {
        id: 6,
        nombre: "Paquete Mexicano",
        precio: "$179",
        imagen: "/paquete-mexicano.jpg",
        categoria: "Barbería",
      },
    ]);
  }, []);

  const categorias = [
    { nombre: "Barbería", icono: <BarberIcon />, color: "#2C3E50" },
    { nombre: "Belleza", icono: <BellezaIcon />, color: "#D4AF37" },
    { nombre: "Clases", icono: <ClaseIcon />, color: "#2C3E50" },
    { nombre: "Especiales", icono: <FavoritoIcon />, color: "#D4AF37" },
  ];

  const beneficios = [
    {
      icono: <EnviosIcon sx={{ fontSize: 50 }} />,
      titulo: "Citas Rápidas",
      descripcion: "Reserva en minutos con disponibilidad real",
    },
    {
      icono: <VerificadoIcon sx={{ fontSize: 50 }} />,
      titulo: "Calidad Garantizada",
      descripcion: "Profesionales certificados",
    },
    {
      icono: <FavoritoIcon sx={{ fontSize: 50 }} />,
      titulo: "Atención Personalizada",
      descripcion: "Estilos adaptados a cada cliente",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        minHeight: "100vh",
        py: 6,
        fontFamily: "'Geist Sans', Arial, sans-serif",
      }}
    >
      <Container maxWidth="lg">

        {/* HERO */}
        <MotionBox
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{
            textAlign: "center",
            mb: 8,
            p: 6,
            background: "linear-gradient(135deg, #2C3E50 0%, #D4AF37 100%)",
            borderRadius: 12,
            color: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            fontFamily="'Playfair Display', serif"
            gutterBottom
          >
            Panel de Recepción
          </Typography>

          <Typography sx={{ mb: 3 }}>
            Gestión rápida de servicios y atención al cliente
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#2C3E50",
              "&:hover": {
                backgroundColor: alpha("#FFFFFF", 0.9),
                color: "#D4AF37",
              },
              borderRadius: 8,
            }}
          >
            Ver servicios
          </Button>
        </MotionBox>

        {/* CATEGORÍAS */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            mb={4}
            fontFamily="'Playfair Display', serif"
            color="#1A252F"
          >
            Categorías
          </Typography>

          <Grid container spacing={3}>
            {categorias.map((cat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <MotionCard
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  sx={{
                    textAlign: "center",
                    p: 3,
                    backgroundColor: cat.color,
                    color: "#fff",
                    borderRadius: 12,
                  }}
                >
                  <Box sx={{ fontSize: 50, mb: 1 }}>
                    {cat.icono}
                  </Box>
                  <Typography fontWeight={600}>
                    {cat.nombre}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* SERVICIOS */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            mb={4}
            fontFamily="'Playfair Display', serif"
            color="#1A252F"
          >
            Servicios destacados
          </Typography>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              {servicios.map((servicio) => (
                <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                  <MotionCard
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      border: `1px solid ${alpha("#2C3E50", 0.2)}`,
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={servicio.imagen}
                      alt={servicio.nombre}
                    />

                    <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                      <Chip
                        label={servicio.categoria}
                        size="small"
                        sx={{
                          mb: 2,
                          backgroundColor:
                            servicio.categoria === "Barbería"
                              ? "#2C3E50"
                              : "#D4AF37",
                          color: "#fff",
                        }}
                      />

                      <Typography fontWeight={600}>
                        {servicio.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                        color={alpha("#1A252F", 0.8)}
                        sx={{ my: 1 }}
                      >
                        Servicio premium
                      </Typography>

                      <Typography
                        fontWeight={700}
                        color="#D4AF37"
                        mb={2}
                      >
                        {servicio.precio}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          backgroundColor: "#D4AF37",
                          color: "#1A252F",
                          borderRadius: 8,
                          "&:hover": {
                            backgroundColor: alpha("#D4AF37", 0.9),
                          },
                        }}
                      >
                        Reservar
                      </Button>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* BENEFICIOS */}
        <Box>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight={700}
            mb={4}
            fontFamily="'Playfair Display', serif"
            color="#1A252F"
          >
            ¿Por qué elegirnos?
          </Typography>

          <Grid container spacing={4}>
            {beneficios.map((b, i) => (
              <Grid item xs={12} md={4} key={i}>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    textAlign: "center",
                    p: 4,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box sx={{ color: "#D4AF37", mb: 2 }}>
                    {b.icono}
                  </Box>

                  <Typography fontWeight={600} gutterBottom>
                    {b.titulo}
                  </Typography>

                  <Typography
                    color={alpha("#1A252F", 0.8)}
                  >
                    {b.descripcion}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>
    </Box>
  );
};

export default PaginaPrincipalRecepcion;