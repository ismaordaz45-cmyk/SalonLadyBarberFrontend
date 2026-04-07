import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Avatar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ContentCut as BarberIcon,
  FaceRetouchingNatural as BellezaIcon,
  School as ClaseIcon,
  LocalShipping as EnviosIcon,
  Payment as PagoIcon,
  Verified as VerificadoIcon,
  Favorite as FavoritoIcon,
  TrendingUp as TrendingIcon,
  ShoppingCart as ReservaIcon,
  CardGiftcard as EspecialIcon,
} from "@mui/icons-material";

// --------------------------------------------------
// Animación al hacer scroll
// --------------------------------------------------
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: false,
    margin: "-100px",
    amount: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

// --------------------------------------------------
// Página principal cliente
// --------------------------------------------------
function PaginaPrincipalCliente() {
  const PALETTE = {
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    primary: "#1E293B",
    secondary: "#64748B",
    accent: "#D4AF37",
    border: "#E2E8F0",
    darkBlue: "#2C3E50",
  };

  const categorias = [
    {
      nombre: "Barbería",
      icono: <BarberIcon sx={{ fontSize: 40 }} />,
      color: PALETTE.darkBlue,
      descripcion: "Cortes y estilos masculinos clásicos",
      imagen: "/barberia-placeholder.jpg",
    },
    {
      nombre: "Belleza",
      icono: <BellezaIcon sx={{ fontSize: 40 }} />,
      color: PALETTE.accent,
      descripcion: "Tratamientos faciales y cuidado personal",
      imagen: "/belleza-placeholder.jpg",
    },
    {
      nombre: "Clases",
      icono: <ClaseIcon sx={{ fontSize: 40 }} />,
      color: PALETTE.darkBlue,
      descripcion: "Lecciones particulares de estilo",
      imagen: "/clases-placeholder.jpg",
    },
    {
      nombre: "Especiales",
      icono: <EspecialIcon sx={{ fontSize: 40 }} />,
      color: PALETTE.accent,
      descripcion: "Paquetes premium personalizados",
      imagen: "/especiales-placeholder.jpg",
    },
  ];

  const serviciosDestacados = [
    {
      nombre: "Corte Premium",
      precio: "$299",
      imagen: "/corte-premium.jpg",
      rating: 5,
      reviews: 128,
      descuento: "20% OFF",
      nuevo: true,
      categoria: "Barbería",
    },
    {
      nombre: "Facial Importado",
      precio: "$149",
      imagen: "/facial-importado.jpg",
      rating: 4.5,
      reviews: 95,
      descuento: null,
      nuevo: false,
      categoria: "Belleza",
    },
    {
      nombre: "Clase Artesanal",
      precio: "$89",
      imagen: "/clase-artesanal.jpg",
      rating: 4.8,
      reviews: 203,
      descuento: "15% OFF",
      nuevo: true,
      categoria: "Clases",
    },
    {
      nombre: "Estilo Vintage",
      precio: "$119",
      imagen: "/estilo-vintage.jpg",
      rating: 4.7,
      reviews: 156,
      descuento: null,
      nuevo: false,
      categoria: "Barbería",
    },
    {
      nombre: "Tratamiento Gourmet",
      precio: "$349",
      imagen: "/tratamiento-gourmet.jpg",
      rating: 5,
      reviews: 89,
      descuento: "10% OFF",
      nuevo: true,
      categoria: "Belleza",
    },
    {
      nombre: "Paquete Mexicano",
      precio: "$179",
      imagen: "/paquete-mexicano.jpg",
      rating: 4.9,
      reviews: 234,
      descuento: null,
      nuevo: false,
      categoria: "Especiales",
    },
  ];

  const beneficios = [
    {
      icono: <EnviosIcon sx={{ fontSize: 50, color: "#D4AF37" }} />,
      titulo: "Citas Rápidas",
      descripcion: "Reserva en minutos con disponibilidad real-time",
    },
    {
      icono: <PagoIcon sx={{ fontSize: 50, color: "#D4AF37" }} />,
      titulo: "Pago Seguro",
      descripcion: "Múltiples métodos de pago confiables",
    },
    {
      icono: <VerificadoIcon sx={{ fontSize: 50, color: "#D4AF37" }} />,
      titulo: "Calidad Garantizada",
      descripcion: "Profesionales certificados y productos premium",
    },
    {
      icono: <FavoritoIcon sx={{ fontSize: 50, color: "#D4AF37" }} />,
      titulo: "Atención Personalizada",
      descripcion: "Servicio al cliente 24/7 dedicado",
    },
  ];

  const testimonios = [
    {
      nombre: "María González",
      avatar: "/mujer-sonriente.jpg",
      comentario:
        "¡Los mejores servicios de barbería! La calidad es excepcional y el servicio es increíble.",
      rating: 5,
      fecha: "Hace 2 días",
    },
    {
      nombre: "Carlos Ramírez",
      avatar: "/hombre-feliz.jpg",
      comentario:
        "Excelente variedad de tratamientos. Mis amigos están encantados con el estilo.",
      rating: 5,
      fecha: "Hace 1 semana",
    },
    {
      nombre: "Ana Martínez",
      avatar: "/young-woman.png",
      comentario:
        "Pedí un paquete y quedaron fascinados. Definitivamente volveré a reservar.",
      rating: 4.5,
      fecha: "Hace 3 días",
    },
  ];

  const estadisticas = [
    { numero: "10,000+", label: "Clientes Felices", icono: <FavoritoIcon /> },
    { numero: "500+", label: "Servicios", icono: <ReservaIcon /> },
    { numero: "15", label: "Años de Experiencia", icono: <TrendingIcon /> },
    { numero: "98%", label: "Satisfacción", icono: <VerificadoIcon /> },
  ];

  return (
    <Box
      sx={{
        bgcolor: PALETTE.bg,
        minHeight: "100vh",
        overflow: "hidden",
        fontFamily: "'Geist Sans', Arial, sans-serif",
      }}
    >

      {/* ---------------- HERO ---------------- */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.darkBlue} 60%, ${PALETTE.accent} 140%)`,
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  textAlign: "center",
                  fontFamily: "'Playfair Display', serif",
                  textShadow: "0 8px 28px rgba(15, 23, 42, 0.35)",
                  lineHeight: 1.1,
                }}
              >
                Lady Barber ID&apos;M
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  mb: 4,
                  fontSize: { xs: "1.125rem", md: "1.5rem" },
                  lineHeight: 1.6,
                  opacity: 0.9,
                }}
              >
                Elegancia dual en barbería y belleza. Transformamos tu estilo con pasión y precisión
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: PALETTE.surface,
                      color: PALETTE.primary,
                      "&:hover": {
                        backgroundColor: alpha(PALETTE.surface, 0.92),
                        color: PALETTE.accent,
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 700,
                    }}
                  >
                    Ver Servicios
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: alpha(PALETTE.surface, 0.9),
                      color: PALETTE.surface,
                      "&:hover": {
                        borderColor: PALETTE.surface,
                        backgroundColor: alpha(PALETTE.surface, 0.1),
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 700,
                    }}
                  >
                    Ofertas Especiales
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </ScrollReveal>
        </Container>
      </Box>

      {/* ---------------- CATEGORÍAS ---------------- */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <ScrollReveal>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 6,
              color: PALETTE.primary,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nuestras Categorías
          </Typography>
        </ScrollReveal>

        <Grid container spacing={3}>
          {categorias.map((categoria, index) => (
            <Grid item xs={6} md={3} key={index}>
              <ScrollReveal delay={index * 0.1}>
                <motion.div whileHover={{ scale: 1.05, y: -10 }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      border: `1px solid ${alpha(categoria.color, 0.2)}`,
                      backgroundColor: PALETTE.surface,
                      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: categoria.color,
                        color: "#fff",
                        p: 3,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {categoria.icono}
                    </Box>

                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: `linear-gradient(170deg, ${alpha(
                          categoria.color,
                          0.12
                        )} 0%, ${alpha(categoria.color, 0.03)} 100%), url(${categoria.imagen})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography fontWeight={700} color={PALETTE.primary}>
                        {categoria.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                        color={PALETTE.secondary}
                      >
                        {categoria.descripcion}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ---------------- SERVICIOS DESTACADOS ---------------- */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(180deg, ${alpha(PALETTE.surface, 0.6)} 0%, ${alpha(
            PALETTE.accent,
            0.05
          )} 100%)`,
          borderTop: `1px solid ${PALETTE.border}`,
          borderBottom: `1px solid ${PALETTE.border}`,
        }}
      >
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 2,
                fontFamily: "'Playfair Display', serif",
                color: PALETTE.primary,
              }}
            >
              Servicios Destacados
            </Typography>
          </ScrollReveal>

          <Grid container spacing={4}>
            {serviciosDestacados.map((servicio, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ScrollReveal delay={index * 0.1}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: PALETTE.surface,
                      border: `1px solid ${PALETTE.border}`,
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    {servicio.nuevo && (
                      <Chip
                        label="NUEVO"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          backgroundColor: PALETTE.accent,
                          color: PALETTE.primary,
                          fontWeight: 700,
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        height: 220,
                        backgroundImage: `linear-gradient(180deg, ${alpha(
                          PALETTE.primary,
                          0.08
                        )} 0%, ${alpha(PALETTE.primary, 0.02)} 100%), url(${servicio.imagen})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <CardContent>
                      <Typography fontWeight={700} color={PALETTE.primary}>
                        {servicio.nombre}
                      </Typography>

                      <Rating
                        value={servicio.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                      />

                      <Typography sx={{ color: PALETTE.accent, fontWeight: 700 }}>
                        {servicio.precio}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 2,
                          backgroundColor: PALETTE.primary,
                          color: PALETTE.surface,
                          fontWeight: 700,
                          "&:hover": {
                            backgroundColor: PALETTE.darkBlue,
                          },
                        }}
                      >
                        Reservar Ahora
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ---------------- BENEFICIOS ---------------- */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {beneficios.map((b, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  border: `1px solid ${PALETTE.border}`,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                {b.icono}
                <Typography fontWeight={700} color={PALETTE.primary}>
                  {b.titulo}
                </Typography>
                <Typography variant="body2" color={PALETTE.secondary}>
                  {b.descripcion}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ---------------- ESTADÍSTICAS ---------------- */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.darkBlue} 70%, ${PALETTE.accent} 150%)`,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {estadisticas.map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box textAlign="center" color="white">
                  {s.icono}
                  <Typography variant="h5">{s.numero}</Typography>
                  <Typography>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ---------------- TESTIMONIOS ---------------- */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <ScrollReveal>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 5,
              fontFamily: "'Playfair Display', serif",
              color: PALETTE.primary,
            }}
          >
            Lo que dicen nuestros clientes
          </Typography>
        </ScrollReveal>
        <Grid container spacing={4}>
          {testimonios.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${PALETTE.border}`,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={t.avatar} sx={{ mr: 2 }} />
                  <Box>
                    <Typography fontWeight={700} color={PALETTE.primary}>
                      {t.nombre}
                    </Typography>
                    <Typography variant="caption" color={PALETTE.secondary}>
                      {t.fecha}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={t.rating} readOnly />
                <Typography variant="body2" fontStyle="italic" color={PALETTE.secondary}>
                  "{t.comentario}"
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

    </Box>
  );
}

export default PaginaPrincipalCliente;