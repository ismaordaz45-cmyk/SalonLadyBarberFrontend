import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import BarberPole from "../componentes/compartidos/BarberPole";
import SeccionUbicacion from "../componentes/compartidos/SeccionUbicacion";
import axios from "axios";
import { logoBase64ToDataUrl } from "../utils/logoDataUrl";
import { resolveServicioImagenUrl } from "../utils/resolveServicioImagenUrl";
import { motion } from "framer-motion";

const IMG = `${process.env.PUBLIC_URL || ""}/images/landing`;

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#F0F7FF",
  text: "#1A3B5B",
  textMuted: "#64748B",
  hover: "#1A3B5B",
  primary: "#1E293B",
  white: "#FFFFFF",
  darkSection: "#1A3B5B",
  accentYellow: "#FACC15"
};

const FALLBACK_PRODUCTS = [
  {
    id: "f1",
    nombre: "Cera Modeladora Premium",
    descripcion: "Fijación fuerte y acabado mate natural. Moldeable durante todo el día.",
    precioUnitario: 250.00,
    imagen: "https://images.unsplash.com/photo-1590156546746-c237f4856ee1?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "f2",
    nombre: "Aceite para Barba Orgánico",
    descripcion: "Suaviza el vello facial, hidrata la piel y aporta un brillo varonil sutil.",
    precioUnitario: 320.00,
    imagen: "https://images.unsplash.com/photo-1626015713026-d837d172406f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "f3",
    nombre: "Shampoo Anticaída Refresh",
    descripcion: "Limpia profundamente, fortalece la raíz y aporta frescura con mentol.",
    precioUnitario: 280.00,
    imagen: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "f4",
    nombre: "Loción After-Shave Calmant",
    descripcion: "Reduce la irritación, cierra los poros y refresca la piel tras el afeitado.",
    precioUnitario: 210.00,
    imagen: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "f5",
    nombre: "Pomada Pompadour Brillo",
    descripcion: "Fijación media con alto brillo para peinados clásicos y elegantes.",
    precioUnitario: 240.00,
    imagen: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60"
  }
];

const PASOS = [
  {
    n: 1,
    tag: "Paso 01",
    titulo: "Selecciona tu servicio",
    subtitulo: "Corte, barba o estilizado",
    texto: "Explora nuestro catálogo con precios transparentes y elige la experiencia que buscas.",
    icon: ContentCutRoundedIcon,
    accent: "#3B82F6",
    link: "/catalogo",
    linkText: "Ver catálogo"
  },
  {
    n: 2,
    tag: "Paso 02",
    titulo: "Elige fecha y hora",
    subtitulo: "Sin esperas ni filas",
    texto: "Selecciona tu estilista o barbero de confianza y agenda en el horario ideal para ti.",
    icon: EventAvailableRoundedIcon,
    accent: "#FACC15",
    link: "/login",
    linkText: "Elegir horario"
  },
  {
    n: 3,
    tag: "Paso 03",
    titulo: "Confirma tu cita",
    subtitulo: "Atención garantizada",
    texto: "Recibe confirmación al instante, recordatorios automáticos y asiste listo para renovar tu look.",
    icon: CheckCircleRoundedIcon,
    accent: "#10B981",
    link: "/login",
    linkText: "Confirmar ahora"
  }
];


const TESTIMONIOS = [
  {
    texto:
      "El mejor salón de la zona. Profesionales, puntuales y un resultado que superó mis expectativas.",
    nombre: "María G.",
    iniciales: "MG"
  },
  {
    texto:
      "Ambiente impecable y atención de primera. Siempre salgo sintiéndome renovada.",
    nombre: "Ana L.",
    iniciales: "AL"
  },
  {
    texto:
      "Reservé en línea sin complicaciones. El corte quedó exactamente como lo pedí.",
    nombre: "Carlos R.",
    iniciales: "CR"
  }
];

const FAQ = [
  {
    q: "¿Cómo puedo agendar una cita?",
    a: "Puedes contactarnos por teléfono, redes sociales o acudir al salón. Pronto podrás agendar también desde esta web."
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos efectivo, tarjetas de débito y crédito, y transferencias según disponibilidad en salón."
  },
  {
    q: "¿Atienden sin cita previa?",
    a: "Depende de la disponibilidad del día. Recomendamos reservar con anticipación para asegurar tu horario preferido."
  }
];

function useInViewOnce(options = { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);

    io.observe(el);
    return () => io.disconnect();
  }, [inView, options]);

  return { ref, inView };
}

function LandingPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const heroPoleWidth = isMdUp ? 22 : isSmUp ? 16 : 11;

  const pasosView = useInViewOnce();
  const testView = useInViewOnce();
  const tradicionView = useInViewOnce();
  const faqView = useInViewOnce();

  const [perfil, setPerfil] = useState(null);
  const [productos, setProductos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get("https://salonladybarberbackend.onrender.com/api/perfil-empresa");
        setPerfil(data);
      } catch (err) {
        console.error("Error al cargar perfil en landing:", err);
      }
    };
    fetchPerfil();
  }, []);

  useEffect(() => {
    // 1. Cargar caché inmediata de localStorage si existe (para render offline instantáneo)
    try {
      const cached = localStorage.getItem("slb_offline_productos");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductos(parsed.slice(0, 12));
        }
      }
    } catch {
      /* fallback */
    }

    const fetchProductos = async () => {
      try {
        const { data } = await axios.get("https://salonladybarberbackend.onrender.com/api/insumos");
        const activos = Array.isArray(data) ? data.filter(p => p.estaActivo === 1 || p.estaActivo === true) : [];
        if (activos.length > 0) {
          // Tomar los primeros 12 productos más destacados / más vendidos
          const top12 = activos.slice(0, 12);
          setProductos(top12);
          try {
            localStorage.setItem("slb_offline_productos", JSON.stringify(top12));
          } catch {
            /* storage limit */
          }
        } else {
          setProductos(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.warn("Sin conexión con API de insumos, manteniendo caché:", err);
        setProductos((prev) => (prev.length > 0 ? prev : FALLBACK_PRODUCTS));
      }
    };
    fetchProductos();
  }, []);

  const heroImage = perfil?.hero_image 
    ? logoBase64ToDataUrl(perfil.hero_image) 
    : `${IMG}/hero-salon.jpg`;

  const itemsPerView = isMdUp ? 3 : isSmUp ? 2 : 1;
  const maxIndex = Math.max(0, productos.length - itemsPerView);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  useEffect(() => {
    if (productos.length <= itemsPerView) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [productos.length, itemsPerView, maxIndex]);


  return (
    <Box
      component="main"
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        fontFamily: "'Geist Sans', Arial, sans-serif",
        "@keyframes slb-fadeUp": {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        "@keyframes slb-fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        "@keyframes slb-pop": {
          "0%": { opacity: 0, transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        }
      }}
    >
      {/* 1. Hero */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "100svh", md: "100vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(15, 23, 42, 0.55)"
          }
        }}
      >
        {/* Postes verticales a altura completa (sin franjas horizontales) */}
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
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              opacity: { xs: 0.9, md: 0.97 },
              filter: "drop-shadow(4px 0 14px rgba(0,0,0,0.4))"
            }}
          />
          <BarberPole
            fullHeight
            width={heroPoleWidth}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              opacity: { xs: 0.9, md: 0.97 },
              filter: "drop-shadow(-4px 0 14px rgba(0,0,0,0.4))"
            }}
          />
        </Box>
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            py: { xs: 8, md: 10 },
            px: { xs: 1.5, sm: 2 },
            textAlign: { xs: "center", md: "left" }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: PALETTE.white,
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                lineHeight: 1.2,
                maxWidth: { md: "48rem" },
                mx: { xs: "auto", md: 0 }
              }}
            >
              Estilo de barbería, acabado de salón: cuidado y profesionalismo
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
          >
            <Typography
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.92)",
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.65,
                maxWidth: { md: "36rem" },
                mx: { xs: "auto", md: 0 }
              }}
            >
              Cortes, barba y detalle con mentalidad de barbería; color, peinado y eventos cuando lo
              necesites. Todo en un solo lugar: Lady Barber.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: { xs: "center", md: "flex-start" },
                alignItems: "center"
              }}
            >
              <Button
                component={Link}
                to="/catalogo"
                variant="contained"
                sx={{
                  bgcolor: PALETTE.white,
                  color: PALETTE.primary,
                  fontWeight: 600,
                  px: 3,
                  py: 1.25,
                  borderRadius: "12px",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: PALETTE.hover, color: PALETTE.primary }
                }}
              >
                Ver catálogo
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{
                  bgcolor: PALETTE.primary,
                  color: PALETTE.white,
                  fontWeight: 600,
                  px: 3,
                  py: 1.25,
                  borderRadius: "12px",
                  textTransform: "none",
                  border: `1px solid ${PALETTE.white}`,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0F172A" }
                }}
              >
                Iniciar sesión
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* 2. Haznos parte de ti */}
      <Box
        ref={pasosView.ref}
        sx={{
          py: { xs: 9, md: 12 },
          bgcolor: "#F8FAFC",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1000px 360px at 15% 15%, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0) 60%), radial-gradient(900px 380px at 85% 75%, rgba(26, 59, 91, 0.08) 0%, rgba(26, 59, 91, 0) 65%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Header de la sección */}
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: -10 }}
              animate={pasosView.inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.75, borderRadius: "999px", bgcolor: "rgba(212, 175, 55, 0.12)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "#856404", fontWeight: 800, fontSize: "0.82rem", mb: 2, letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              <AutoFixHighRoundedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
              Proceso Simple & Rápido
            </Box>

            <Typography
              variant="h3"
              component="h2"
              sx={{
                color: "#163050",
                fontWeight: 900,
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: { xs: "2.3rem", sm: "3rem", md: "3.5rem" },
                letterSpacing: "-0.02em",
                mb: 2,
                position: "relative",
                display: "inline-block"
              }}
            >
              Haznos parte de ti
            </Typography>

            <Typography
              sx={{
                color: PALETTE.textMuted,
                maxWidth: 620,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.15rem" },
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              Tu estilo impecable y tu cita asegurada en <strong style={{ color: "#163050" }}>3 sencillos pasos</strong>. Rápido, transparente y sin complicaciones.
            </Typography>
          </Box>

          {/* Tarjetas interactivas con línea conectora */}
          <Box sx={{ position: "relative" }}>
            {/* Línea conectora visible en Desktop */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                top: 72,
                left: "15%",
                right: "15%",
                height: 3,
                background: "linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(250, 204, 21, 0.5) 50%, rgba(16, 185, 129, 0.3) 100%)",
                borderRadius: 2,
                zIndex: 0
              }}
            />

            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
              {PASOS.map((p, idx) => {
                const IconComponent = p.icon;
                return (
                  <Grid item xs={12} sm={6} md={4} key={p.n}>
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 35 }}
                      animate={pasosView.inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 14,
                        delay: idx * 0.18
                      }}
                      whileHover={{ y: -10, transition: { duration: 0.25 } }}
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        bgcolor: "#FFFFFF",
                        borderRadius: 5,
                        p: { xs: 3.5, md: 4 },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        border: "1px solid rgba(226, 232, 240, 0.9)",
                        boxShadow: "0 12px 35px -8px rgba(15, 23, 42, 0.08)",
                        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: p.accent,
                          boxShadow: `0 24px 50px -12px ${p.accent}33`,
                          "& .step-badge": {
                            transform: "scale(1.1) rotate(6deg)",
                            boxShadow: `0 12px 28px ${p.accent}55`
                          },
                          "& .step-action-btn": {
                            bgcolor: p.accent,
                            color: "#163050",
                            transform: "translateX(3px)"
                          }
                        }
                      }}
                    >
                      {/* Badge con Icono y Número */}
                      <Box sx={{ position: "relative", mb: 3 }}>
                        <Box
                          className="step-badge"
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: "22px",
                            bgcolor: "#163050",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 10px 24px rgba(22, 48, 80, 0.25)",
                            border: "3px solid #FFFFFF",
                            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
                          }}
                        >
                          <IconComponent sx={{ fontSize: 34, color: p.accent }} />
                        </Box>
                        {/* Indicador numérico flotante */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            bgcolor: p.accent,
                            color: "#163050",
                            fontWeight: 900,
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #FFFFFF",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.15)"
                          }}
                        >
                          {p.n}
                        </Box>
                      </Box>

                      {/* Tag de paso */}
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: p.accent,
                          bgcolor: `${p.accent}18`,
                          px: 1.5,
                          py: 0.3,
                          borderRadius: 99,
                          mb: 1.5
                        }}
                      >
                        {p.tag}
                      </Typography>

                      {/* Título y subtítulo */}
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontWeight: 800,
                          color: "#163050",
                          fontFamily: "'Playfair Display', 'Georgia', serif",
                          fontSize: "1.35rem",
                          mb: 0.8,
                          lineHeight: 1.3
                        }}
                      >
                        {p.titulo}
                      </Typography>

                      <Typography
                        sx={{
                          color: p.accent === "#FACC15" ? "#B45309" : p.accent,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          mb: 2
                        }}
                      >
                        {p.subtitulo}
                      </Typography>

                      {/* Descripción */}
                      <Typography
                        sx={{
                          color: PALETTE.textMuted,
                          fontSize: "0.95rem",
                          lineHeight: 1.65,
                          mb: 3,
                          flexGrow: 1
                        }}
                      >
                        {p.texto}
                      </Typography>

                      {/* Botón de acción rápido */}
                      <Button
                        component={Link}
                        to={p.link}
                        className="step-action-btn"
                        endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          mt: "auto",
                          bgcolor: "#F1F5F9",
                          color: "#163050",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          px: 2.5,
                          py: 0.9,
                          borderRadius: "12px",
                          textTransform: "none",
                          width: "100%",
                          transition: "all 0.25s ease"
                        }}
                      >
                        {p.linkText}
                      </Button>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* 3. Carrusel de productos más vendidos */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: PALETTE.darkSection,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 520px at 50% 0%, rgba(250, 204, 21, 0.15) 0%, rgba(250,204,21,0) 60%), radial-gradient(900px 520px at 0% 100%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 55%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                color: PALETTE.white,
                fontWeight: 800,
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3.25rem" },
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
                  width: "60px",
                  height: "4px",
                  borderRadius: "2px",
                  background: `linear-gradient(90deg, ${PALETTE.white} 0%, ${PALETTE.accentYellow} 100%)`
                }
              }}
            >
              Productos más vendidos
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.85)",
                mt: 3,
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                fontWeight: 500,
                maxWidth: 600,
                mx: "auto"
              }}
            >
              Lleva la experiencia del salón a tu casa con nuestra selección de productos premium para cuidado capilar y barba.
            </Typography>
          </Box>

          {/* Carrusel */}
          <Box sx={{ position: "relative", px: { xs: 4, sm: 6 } }}>
            {/* Contenedor de las tarjetas */}
            <Box sx={{ overflow: "hidden", mx: -1 }}>
              <motion.div
                animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 25 }}
                style={{
                  display: "flex",
                  width: "100%",
                  touchAction: "pan-y"
                }}
              >
                {productos.map((prod) => (
                  <Box
                    key={prod.id}
                    sx={{
                      width: `${100 / itemsPerView}%`,
                      flexShrink: 0,
                      px: 1.5,
                      boxSizing: "border-box"
                    }}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ y: -8 }}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.06)",
                        borderRadius: 4,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 18px 46px rgba(0,0,0,0.22)",
                        backdropFilter: "blur(10px)",
                        overflow: "hidden",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          borderColor: "rgba(250, 204, 21, 0.42)",
                          boxShadow: "0 26px 70px rgba(0,0,0,0.35)"
                        }
                      }}
                    >
                      {/* Imagen */}
                      <Box sx={{ position: "relative", height: 200, overflow: "hidden", bgcolor: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={resolveServicioImagenUrl(prod.imagen, "https://salonladybarberbackend.onrender.com") || "https://images.unsplash.com/photo-1590156546746-c237f4856ee1?w=500&auto=format&fit=crop&q=60"}
                          alt={prod.nombre}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1590156546746-c237f4856ee1?w=500&auto=format&fit=crop&q=60";
                          }}
                          sx={{
                            objectFit: "contain",
                            p: 1.5,
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.05)"
                            }
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: PALETTE.accentYellow,
                            color: PALETTE.primary,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                          }}
                        >
                          Más Vendido
                        </Box>
                      </Box>

                      {/* Contenido */}
                      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: PALETTE.white,
                            fontSize: "1.1rem",
                            mb: 1,
                            lineHeight: 1.3,
                            height: "2.6em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {prod.nombre}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.72)",
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            mb: 2.5,
                            height: "4.5em",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {prod.descripcion || "Producto exclusivo para el cuidado personal y estilizado profesional."}
                        </Typography>
                        <Box sx={{ mt: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography sx={{ color: PALETTE.accentYellow, fontWeight: 900, fontSize: "1.2rem" }}>
                            ${Number(prod.precioUnitario || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </Typography>
                          <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: PALETTE.accentYellow,
                              color: PALETTE.primary,
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderRadius: "10px",
                              textTransform: "none",
                              px: 2,
                              py: 0.75,
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "#EAB308",
                                boxShadow: "none"
                              }
                            }}
                          >
                            Comprar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </motion.div>
            </Box>

            {/* Controles del carrusel */}
            {productos.length > itemsPerView && (
              <>
                <Button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    minWidth: 44,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: PALETTE.white,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)"
                    },
                    "&.Mui-disabled": {
                      opacity: 0.3,
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }
                  }}
                >
                  &#10094;
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    minWidth: 44,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: PALETTE.white,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.2)"
                    },
                    "&.Mui-disabled": {
                      opacity: 0.3,
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }
                  }}
                >
                  &#10095;
                </Button>
              </>
            )}
          </Box>

          {/* Indicadores de puntos */}
          {productos.length > itemsPerView && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4 }}>
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  sx={{
                    width: currentIndex === idx ? 24 : 8,
                    height: 8,
                    borderRadius: "4px",
                    bgcolor: currentIndex === idx ? PALETTE.accentYellow : "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </Box>
          )}

          {/* Botón ver todo el catálogo */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Button
              component={Link}
              to="/catalogo"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: PALETTE.accentYellow,
                color: PALETTE.primary,
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 18px 40px rgba(250, 204, 21, 0.18)",
                transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
                "&:hover": { bgcolor: "#EAB308", transform: "translateY(-2px)", boxShadow: "0 22px 54px rgba(250, 204, 21, 0.26)" },
                "&:active": { transform: "translateY(0px) scale(0.99)" }
              }}
            >
              Explorar catálogo completo
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 4. Testimonios */}
      <Box ref={testView.ref} sx={{ py: { xs: 6, md: 8 }, bgcolor: "#F8FAFC" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ color: PALETTE.text, fontWeight: 700, mb: 4 }}>
            Lo que dicen nuestros clientes
          </Typography>
          <Grid container spacing={3}>
            {TESTIMONIOS.map((t) => (
              <Grid item xs={12} md={4} key={t.iniciales}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid rgba(15, 23, 42, 0.14)",
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 16px 34px rgba(15, 23, 42, 0.10)",
                    transform: testView.inView ? "none" : "translateY(16px)",
                    opacity: testView.inView ? 1 : 0,
                    transition: "transform 800ms cubic-bezier(0.2,0.8,0.2,1), opacity 800ms ease, box-shadow 220ms ease, border-color 220ms ease",
                    "&:hover": {
                      transform: testView.inView ? "translateY(-6px)" : "translateY(16px)",
                      boxShadow: "0 22px 54px rgba(15, 23, 42, 0.14)",
                      borderColor: "rgba(26, 59, 91, 0.26)"
                    }
                  }}
                >
                  <CardContent>
                    <Typography sx={{ color: PALETTE.text, fontSize: "0.95rem", lineHeight: 1.65, mb: 2 }}>
                      &ldquo;{t.texto}&rdquo;
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.25, mb: 2 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarRoundedIcon key={i} sx={{ color: "#EC4899", fontSize: 22 }} />
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          bgcolor: "#0F172A",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          boxShadow: "0 12px 22px rgba(15, 23, 42, 0.18)"
                        }}
                      >
                        {t.iniciales}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#0F172A",
                            letterSpacing: "0.01em",
                            display: "inline-flex",
                            alignItems: "center",
                            width: "fit-content",
                            px: 1.2,
                            py: 0.35,
                            borderRadius: 999,
                            bgcolor: "rgba(250, 204, 21, 0.22)",
                            border: "1px solid rgba(250, 204, 21, 0.36)"
                          }}
                        >
                          {t.nombre}
                        </Typography>
                        <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.85rem" }}>
                          Cliente verificado
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Tradición y calidad */}
      <Box
        ref={tradicionView.ref}
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: PALETTE.darkSection,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 520px at 15% 40%, rgba(250, 204, 21, 0.18) 0%, rgba(250,204,21,0) 62%), radial-gradient(900px 520px at 85% 70%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 58%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 28px 74px rgba(0,0,0,0.40)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transform: tradicionView.inView ? "none" : "translateY(20px)",
                  opacity: tradicionView.inView ? 1 : 0,
                  transition: "all 900ms cubic-bezier(0.2,0.8,0.2,1)"
                }}
              >
                <Box
                  component="img"
                  src={`${IMG}/tradicion-calidad.jpg`}
                  alt="Tradición y calidad en Lady Barber"
                  sx={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                    maxHeight: 420,
                    filter: "contrast(1.05) brightness(0.95)",
                    transition: "transform 0.6s ease",
                    "&:hover": {
                      transform: "scale(1.04)"
                    }
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(26, 59, 91, 0.1) 0%, rgba(15, 23, 42, 0.75) 100%)",
                    pointerEvents: "none"
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    right: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "rgba(22, 48, 80, 0.85)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.5,
                    border: "1px solid rgba(250, 204, 21, 0.3)"
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#FACC15", fontWeight: 800, fontSize: "0.95rem" }}>
                      Maestría & Cuidado
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>
                      Técnica profesional en cada corte
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "#FACC15",
                      color: "#163050",
                      fontWeight: 900,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    100% Calidad
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: PALETTE.white,
                  fontWeight: 900,
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  fontSize: { xs: "1.9rem", sm: "2.4rem", md: "2.7rem" },
                  mb: 2.5,
                  letterSpacing: "-0.01em",
                  opacity: tradicionView.inView ? 1 : 0,
                  transform: tradicionView.inView ? "none" : "translateY(14px)",
                  transition: "opacity 800ms ease, transform 800ms ease"
                }}
              >
                Tradición y calidad en cada servicio
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.88)",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                  mb: 3,
                  opacity: tradicionView.inView ? 1 : 0,
                  transform: tradicionView.inView ? "none" : "translateY(14px)",
                  transition: "opacity 800ms ease 120ms, transform 800ms ease 120ms"
                }}
              >
                En Lady Barber combinamos experiencia, técnicas actualizadas y un trato cercano para que cada
                visita sea memorable. Trabajamos con productos de confianza y un equipo que escucha lo que
                necesitas, para que salgas con la seguridad de lucir como quieres. Nuestra prioridad es tu
                bienestar y el resultado impecable que mereces.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 6. Ubicación y Cómo Llegar con Google Maps */}
      <SeccionUbicacion perfil={perfil} />

      {/* 7. FAQ */}
      <Box ref={faqView.ref} sx={{ py: { xs: 6, md: 8 }, bgcolor: PALETTE.pageBg }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" sx={{ color: PALETTE.text, fontWeight: 700, mb: 3 }}>
            Preguntas frecuentes
          </Typography>
          {FAQ.map((item, i) => (
            <Accordion
              key={item.q}
              defaultExpanded={i === 0}
              elevation={0}
              sx={{
                mb: 1,
                borderRadius: "12px !important",
                border: `1px solid ${PALETTE.hover}`,
                bgcolor: PALETTE.card,
                "&:before": { display: "none" }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: PALETTE.text }} />}>
                <Typography sx={{ fontWeight: 600, color: PALETTE.text }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.65 }}>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
