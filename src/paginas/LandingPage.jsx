import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { resolveServicioImagenUrl as resolveImageUrl } from "../utils/resolveServicioImagenUrl";

const API_URL = "http://localhost:4000";

const IMG = `${process.env.PUBLIC_URL || ""}/images/landing`;

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  hover: "#E2E8F0",
  primary: "#1E293B",
  white: "#FFFFFF",
  darkSection: "#0F172A",
  accentYellow: "#FACC15"
};

const PLACEHOLDER_CATEGORIA = `${IMG}/placeholder-categoria.svg`;

const CATEGORIA_ORDER = [
  "Cortes de Cabello",
  "Peinados y Estilizado",
  "Coloración y Tratamientos Capilares",
  "Barbería y Arreglo Facial",
  "Servicios Especiales"
];

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
    imagen: `${IMG}/evento-bodas.jpg`
  },
  {
    key: "xv",
    titulo: "XV Años",
    subtitulo: "Looks memorables para celebrar tu transición con estilo.",
    imagen: `${IMG}/evento-xv-anos.jpg`
  },
  {
    key: "grad",
    titulo: "Graduaciones",
    subtitulo: "Estilos impecables para tu logro académico.",
    imagen: `${IMG}/evento-graduaciones.jpg`
  },
  {
    key: "pres",
    titulo: "Presentaciones",
    subtitulo: "Imagen cuidada para eventos formales y profesionales.",
    imagen: `${IMG}/evento-presentaciones.jpg`
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

function sortCategorias(list) {
  const orderIndex = (name) => {
    const i = CATEGORIA_ORDER.indexOf(name);
    return i === -1 ? 999 : i;
  };
  return [...list].sort((a, b) => orderIndex(a.nombre) - orderIndex(b.nombre));
}

function LandingPage() {
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [cargandoCats, setCargandoCats] = useState(true);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/servicios`);
        if (!Array.isArray(data) || cancel) return;

        const map = new Map();
        for (const s of data) {
          const raw = s.categoria;
          const nombre = raw != null && String(raw).trim() !== "" ? String(raw).trim() : "Sin categoría";
          if (!map.has(nombre)) {
            map.set(nombre, {
              nombre,
              descripcion: s.descripcion || "",
              imagenUrl: resolveImageUrl(s.imagenUrl)
            });
          } else {
            const cur = map.get(nombre);
            if (!cur.imagenUrl) cur.imagenUrl = resolveImageUrl(s.imagenUrl);
            if (!cur.descripcion && s.descripcion) cur.descripcion = s.descripcion;
          }
        }
        const sorted = sortCategorias(Array.from(map.values()));
        setCategoriasApi(sorted.slice(0, 5));
      } catch (e) {
        console.warn("No se pudieron cargar categorías desde servicios:", e?.message);
        setCategoriasApi([]);
      } finally {
        if (!cancel) setCargandoCats(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const categoriasMostrar = useMemo(() => {
    if (categoriasApi.length > 0) return categoriasApi;
    return CATEGORIA_ORDER.slice(0, 5).map((nombre) => ({
      nombre,
      descripcion: "Descubre nuestros servicios en esta categoría.",
      imagenUrl: null
    }));
  }, [categoriasApi]);

  return (
    <Box
      component="main"
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        fontFamily: "'Geist Sans', Arial, sans-serif"
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
          backgroundImage: `url(${IMG}/hero-salon.jpg)`,
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
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            py: { xs: 8, md: 10 },
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
            La combinación perfecta entre estilo, cuidado y profesionalismo
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
            Llevamos estilo y cuidado personal a tu alcance. Servicios profesionales diseñados para
            resaltar tu imagen y celebrar tu estilo en Lady Barber.
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

      {/* 2. Categorías destacadas */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: PALETTE.text, fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.75rem" } }}
          >
            Categorías destacadas
          </Typography>
          <Typography sx={{ color: PALETTE.textMuted, mt: 1, mb: 4 }}>
            Luce siempre perfecto
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
              gap: 2
            }}
          >
            {categoriasMostrar.map((cat) => (
              <Card
                key={cat.nombre}
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  border: `1px solid ${PALETTE.hover}`,
                  bgcolor: PALETTE.card,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={cat.imagenUrl || PLACEHOLDER_CATEGORIA}
                  alt={cat.nombre}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: PALETTE.text, fontSize: "0.95rem" }}>
                    {cat.nombre}
                  </Typography>
                  <Typography
                    sx={{
                      color: PALETTE.textMuted,
                      fontSize: "0.8rem",
                      mt: 0.5,
                      mb: 1.5,
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {cat.descripcion || "Explora servicios en esta categoría."}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/catalogo?categoria=${encodeURIComponent(cat.nombre)}`}
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{
                      bgcolor: PALETTE.primary,
                      color: PALETTE.white,
                      textTransform: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#0F172A" }
                    }}
                  >
                    Ver más
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
          {cargandoCats && (
            <Typography sx={{ color: PALETTE.textMuted, mt: 2, fontSize: "0.9rem" }}>
              Cargando categorías…
            </Typography>
          )}
        </Container>
      </Box>

      {/* 3. Házonos parte de ti */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: PALETTE.pageBg }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ color: PALETTE.text, fontWeight: 700 }}>
            Házonos parte de ti
          </Typography>
          <Typography sx={{ color: PALETTE.textMuted, mt: 1, mb: 4 }}>
            Tu cita lista en 3 sencillos pasos.
          </Typography>
          <Grid container spacing={3}>
            {PASOS.map((p) => (
              <Grid item xs={12} md={4} key={p.n}>
                <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#0F172A",
                      color: PALETTE.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      mx: { xs: "auto", md: 0 },
                      mb: 2
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

      {/* 4. Eventos especiales */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: PALETTE.darkSection }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: PALETTE.white, fontWeight: 700, textAlign: "center" }}
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
              lineHeight: 1.65
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
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.12)"
                  }}
                >
                  <CardMedia component="img" height="160" image={ev.imagen} alt={ev.titulo} sx={{ objectFit: "cover" }} />
                  <CardContent>
                    <Typography sx={{ fontWeight: 700, color: PALETTE.white }}>{ev.titulo}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", mt: 0.5, mb: 2 }}>
                      {ev.subtitulo}
                    </Typography>
                    <Button
                      fullWidth
                      sx={{
                        bgcolor: PALETTE.accentYellow,
                        color: PALETTE.primary,
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "10px",
                        "&:hover": { bgcolor: "#EAB308" }
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
              to="/nosotros"
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
                "&:hover": { bgcolor: "#EAB308" }
              }}
            >
              Cotizar mi evento soñado
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 5. Testimonios */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
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
                    borderRadius: 2,
                    border: `1px solid ${PALETTE.hover}`,
                    bgcolor: "#F8FAFC"
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
                          bgcolor: PALETTE.hover,
                          color: PALETTE.text,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.9rem"
                        }}
                      >
                        {t.iniciales}
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: PALETTE.text }}>{t.nombre}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 6. Tradición y calidad */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: PALETTE.darkSection }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={`${IMG}/tradicion-calidad.jpg`}
                alt="Tradición y calidad"
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  display: "block",
                  objectFit: "cover",
                  maxHeight: 380
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" sx={{ color: PALETTE.white, fontWeight: 700, mb: 2 }}>
                Tradición y calidad en cada servicio
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.75, fontSize: "1rem" }}>
                En Lady Barber combinamos experiencia, técnicas actualizadas y un trato cercano para que cada
                visita sea memorable. Trabajamos con productos de confianza y un equipo que escucha lo que
                necesitas, para que salgas con la seguridad de lucir como quieres. Nuestra prioridad es tu
                bienestar y el resultado impecable que mereces.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. FAQ */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: PALETTE.pageBg }}>
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
