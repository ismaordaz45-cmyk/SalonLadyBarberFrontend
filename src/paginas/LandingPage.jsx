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
import BarberPole from "../componentes/compartidos/BarberPole";
import axios from "axios";
import { logoBase64ToDataUrl } from "../utils/logoDataUrl";

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

const PASOS = [
  {
    n: 1,
    titulo: "Selecciona tu servicio",
    texto: "Explora nuestro catálogo y elige el servicio que mejor se adapta a ti."
  },
  {
    n: 2,
    titulo: "Elige fecha y hora",
    texto: "Consulta disponibilidad y reserva el momento que te convenga."
  },
  {
    n: 3,
    titulo: "Confirma tu cita",
    texto: "Recibe la confirmación y solo preocúpate por lucir increíble."
  }
];

const EVENTOS = [
  {
    key: "bodas",
    titulo: "Bodas",
    subtitulo: "Peinados y maquillaje para el día más especial.",
    imagen: `${IMG}/evento-bodas.svg`
  },
  {
    key: "xv",
    titulo: "XV Años",
    subtitulo: "Looks memorables para celebrar tu transición con estilo.",
    imagen: `${IMG}/evento-xv-anos.svg`
  },
  {
    key: "grad",
    titulo: "Graduaciones",
    subtitulo: "Estilos impecables para tu logro académico.",
    imagen: `${IMG}/evento-graduaciones.svg`
  },
  {
    key: "pres",
    titulo: "Presentaciones",
    subtitulo: "Imagen cuidada para eventos formales y profesionales.",
    imagen: `${IMG}/evento-presentaciones.svg`
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
  const eventosView = useInViewOnce();
  const testView = useInViewOnce();
  const tradicionView = useInViewOnce();
  const faqView = useInViewOnce();

  const [imgReady, setImgReady] = useState(() => ({
    bodas: false,
    xv: false,
    grad: false,
    pres: false,
    tradicion: false
  }));

  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/perfil-empresa");
        setPerfil(data);
      } catch (err) {
        console.error("Error al cargar perfil en landing:", err);
      }
    };
    fetchPerfil();
  }, []);

  const heroImage = perfil?.hero_image 
    ? logoBase64ToDataUrl(perfil.hero_image) 
    : `${IMG}/hero-salon.svg`;


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
        </Container>
      </Box>

      {/* 2. Házonos parte de ti */}
      <Box
        ref={pasosView.ref}
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "#EEF2FF",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 280px at 20% 10%, rgba(250, 204, 21, 0.18) 0%, rgba(250,204,21,0) 60%), radial-gradient(760px 320px at 80% 60%, rgba(26, 59, 91, 0.12) 0%, rgba(26,59,91,0) 65%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ color: PALETTE.text, fontWeight: 700 }}>
            Haznos parte de ti
          </Typography>
          <Typography sx={{ color: PALETTE.textMuted, mt: 1, mb: 4 }}>
            Tu cita lista en 3 sencillos pasos.
          </Typography>
          <Grid container spacing={3}>
            {PASOS.map((p) => (
              <Grid item xs={12} md={4} key={p.n}>
                <Box
                  sx={{
                    textAlign: { xs: "center", md: "left" },
                    borderRadius: 3,
                    p: { xs: 3, md: 3.5 },
                    bgcolor: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(26, 59, 91, 0.14)",
                    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.10)",
                    backdropFilter: "blur(6px)",
                    transform: pasosView.inView ? "none" : "translateY(18px)",
                    opacity: pasosView.inView ? 1 : 0,
                    transition: `transform 700ms cubic-bezier(0.2,0.8,0.2,1) ${120 + p.n * 90}ms, opacity 700ms ease ${120 + p.n * 90}ms`,
                    "&:hover": {
                      transform: pasosView.inView ? "translateY(-4px)" : "translateY(18px)",
                      boxShadow: "0 18px 46px rgba(15, 23, 42, 0.16)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "rgba(15, 23, 42, 0.96)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      mx: { xs: "auto", md: 0 },
                      mb: 2,
                      boxShadow: "0 10px 22px rgba(15, 23, 42, 0.22)"
                    }}
                  >
                    {p.n}
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>{p.titulo}</Typography>
                  <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.95rem", lineHeight: 1.6 }}>
                    {p.texto}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. Eventos especiales */}
      <Box
        ref={eventosView.ref}
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
              "radial-gradient(1200px 520px at 50% 0%, rgba(250, 204, 21, 0.20) 0%, rgba(250,204,21,0) 60%), radial-gradient(900px 520px at 0% 100%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%)",
            pointerEvents: "none"
          }
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: PALETTE.white,
              fontWeight: 800,
              textAlign: "center",
              letterSpacing: "0.02em",
              opacity: eventosView.inView ? 1 : 0,
              transform: eventosView.inView ? "none" : "translateY(14px)",
              transition: "opacity 700ms ease, transform 700ms ease"
            }}
          >
            Haznos parte de tus eventos especiales
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              mt: 1.5,
              mb: 4,
              textAlign: "center",
              maxWidth: 720,
              mx: "auto",
              lineHeight: 1.65,
              opacity: eventosView.inView ? 1 : 0,
              transform: eventosView.inView ? "none" : "translateY(14px)",
              transition: "opacity 700ms ease 120ms, transform 700ms ease 120ms"
            }}
          >
            Transformamos tus momentos más importantes en recuerdos eternos con looks pensados para cada
            ocasión.
          </Typography>
          <Grid container spacing={2}>
            {EVENTOS.map((ev) => (
              <Grid item xs={12} sm={6} md={3} key={ev.key}>
                <Card
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 18px 46px rgba(0,0,0,0.22)",
                    transform: eventosView.inView ? "none" : "translateY(16px)",
                    opacity: eventosView.inView ? 1 : 0,
                    transition: `transform 800ms cubic-bezier(0.2,0.8,0.2,1) ${120 + (ev.key === "bodas" ? 0 : ev.key === "xv" ? 1 : ev.key === "grad" ? 2 : 3) * 90}ms, opacity 800ms ease ${120 + (ev.key === "bodas" ? 0 : ev.key === "xv" ? 1 : ev.key === "grad" ? 2 : 3) * 90}ms, box-shadow 250ms ease, border-color 250ms ease`,
                    "&:hover": {
                      transform: eventosView.inView ? "translateY(-8px)" : "translateY(16px)",
                      boxShadow: "0 26px 70px rgba(0,0,0,0.34)",
                      borderColor: "rgba(250, 204, 21, 0.42)"
                    }
                  }}
                >
                  <Box sx={{ position: "relative", height: 160, overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={ev.imagen}
                      alt={ev.titulo}
                      onLoad={() => setImgReady((s) => ({ ...s, [ev.key]: true }))}
                      sx={{
                        objectFit: "cover",
                        transform: imgReady[ev.key] ? "none" : "scale(1.06)",
                        opacity: imgReady[ev.key] ? 1 : 0,
                        transition: "transform 700ms cubic-bezier(0.2,0.8,0.2,1), opacity 700ms ease",
                        filter: "saturate(1.04) contrast(1.05)"
                      }}
                    />
                    <Box
                      aria-hidden
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.24) 65%, rgba(0,0,0,0.46) 100%)",
                        opacity: 0.9
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography sx={{ fontWeight: 800, color: PALETTE.white, letterSpacing: "0.01em" }}>
                      {ev.titulo}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", mt: 0.5, mb: 2 }}>
                      {ev.subtitulo}
                    </Typography>
                    <Button
                      component={Link}
                      to="/login"
                      fullWidth
                      sx={{
                        bgcolor: PALETTE.accentYellow,
                        color: PALETTE.primary,
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "12px",
                        boxShadow: "0 14px 28px rgba(250, 204, 21, 0.18)",
                        transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
                        "&:hover": {
                          bgcolor: "#EAB308",
                          transform: "translateY(-2px)",
                          boxShadow: "0 18px 36px rgba(250, 204, 21, 0.26)"
                        },
                        "&:active": {
                          transform: "translateY(0px) scale(0.99)"
                        }
                      }}
                    >
                      Cotizar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              component={Link}
              to="/login"
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
              Cotizar mi evento soñado
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
                component="img"
                src={`${IMG}/tradicion-calidad.svg`}
                alt="Tradición y calidad"
                onLoad={() => setImgReady((s) => ({ ...s, tradicion: true }))}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  display: "block",
                  objectFit: "cover",
                  maxHeight: 380,
                  opacity: imgReady.tradicion ? 1 : 0,
                  transform: imgReady.tradicion ? "none" : "translateY(10px) scale(1.01)",
                  transition: "opacity 800ms ease, transform 900ms cubic-bezier(0.2,0.8,0.2,1)",
                  boxShadow: "0 28px 74px rgba(0,0,0,0.30)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: PALETTE.white,
                  fontWeight: 900,
                  mb: 2,
                  letterSpacing: "0.01em",
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
                  lineHeight: 1.75,
                  fontSize: "1rem",
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

      {/* 6. FAQ */}
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
