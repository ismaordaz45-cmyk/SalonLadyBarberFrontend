import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Skeleton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { resolveServicioImagenUrl } from "../utils/resolveServicioImagenUrl";
import { motion } from "framer-motion";

const API_URL = "https://salonladybarberbackend.onrender.com";

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  primary: "#1E293B",
  white: "#FFFFFF"
};

function PaginaCatalogoPublico() {
  const [searchParams] = useSearchParams();
  const categoriaQuery = searchParams.get("categoria") || "";
  const textoQuery = (searchParams.get("q") || "").toLowerCase().trim();

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imgErrorById, setImgErrorById] = useState({});

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/servicios`);
        if (!cancel && Array.isArray(data)) setServicios(data);
      } catch (e) {
        console.warn("Catálogo: no se pudieron cargar servicios", e?.message);
        if (!cancel) setServicios([]);
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, []);



  const categorias = useMemo(() => {
    const set = new Set();
    servicios.forEach((s) => {
      if (s.categoria && String(s.categoria).trim()) set.add(String(s.categoria).trim());
    });
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [servicios]);

  const [filtroCat, setFiltroCat] = useState("Todas");

  useEffect(() => {
    if (!categoriaQuery) return;
    const exists = servicios.some((s) => String(s.categoria || "").trim() === categoriaQuery);
    if (exists) setFiltroCat(categoriaQuery);
  }, [categoriaQuery, servicios]);

  const filtrados = useMemo(() => {
    return servicios.filter((s) => {
      const matchCat = filtroCat === "Todas" || String(s.categoria || "").trim() === filtroCat;
      const matchTexto = !textoQuery || 
        String(s.nombre || "").toLowerCase().includes(textoQuery) || 
        String(s.descripcion || "").toLowerCase().includes(textoQuery);
      return matchCat && matchTexto;
    });
  }, [servicios, filtroCat, textoQuery]);

  return (
    <Box
      sx={{
        bgcolor: "#F8FAFC",
        minHeight: "100vh",
        py: { xs: 4, md: 7 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1100px 420px at 15% 10%, rgba(212, 175, 55, 0.10) 0%, rgba(212, 175, 55, 0) 60%), radial-gradient(900px 400px at 85% 85%, rgba(26, 59, 91, 0.08) 0%, rgba(26, 59, 91, 0) 65%)",
          pointerEvents: "none"
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Banner superior estilizado */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Chip
            icon={<AutoFixHighRoundedIcon sx={{ fontSize: "15px !important", color: "#D4AF37 !important" }} />}
            label="Catálogo Oficial de Experiencias"
            size="small"
            sx={{
              bgcolor: alpha("#D4AF37", 0.14),
              color: "#856404",
              fontWeight: 800,
              fontSize: "0.8rem",
              px: 1.5,
              py: 0.5,
              mb: 2,
              border: `1px solid ${alpha("#D4AF37", 0.3)}`
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "#163050",
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: { xs: "2.3rem", sm: "3.2rem", md: "3.6rem" },
              letterSpacing: "-0.02em",
              mb: 1.5
            }}
          >
            Nuestros Servicios
          </Typography>
          <Typography
            sx={{
              color: PALETTE.textMuted,
              maxWidth: 620,
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.15rem" },
              lineHeight: 1.6
            }}
          >
            Técnica artesanal, vanguardia y productos de primera categoría. Encuentra el corte, tratamiento o perfilado perfecto para ti.
          </Typography>
        </Box>

        {/* Barra de Filtros y Navegación */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 4,
            p: { xs: 2, sm: 2.5 },
            bgcolor: "#FFFFFF",
            borderRadius: 4,
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 8px 24px -6px rgba(15, 23, 42, 0.05)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#163050", fontWeight: 700, fontSize: "0.95rem" }}>
              <FilterListRoundedIcon sx={{ fontSize: 20, color: "#D4AF37" }} />
              Categoría:
            </Box>
            <TextField
              select
              size="small"
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
              sx={{
                minWidth: 190,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#F8FAFC"
                }
              }}
            >
              {categorias.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            {textoQuery && (
              <Chip
                label={`Búsqueda: "${textoQuery}"`}
                onDelete={() => window.history.pushState({}, "", "/catalogo")}
                size="small"
                sx={{ bgcolor: alpha("#163050", 0.08), color: "#163050", fontWeight: 700 }}
              />
            )}
          </Box>

          <Button
            component={RouterLink}
            to="/"
            variant="text"
            sx={{
              color: "#163050",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              px: 2,
              "&:hover": { bgcolor: "rgba(22, 48, 80, 0.06)" }
            }}
          >
            ← Volver al inicio
          </Button>
        </Box>

        {/* Estado de Carga */}
        {cargando && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Box sx={{ p: 2, bgcolor: "#FFFFFF", borderRadius: 4, border: "1px solid #E2E8F0" }}>
                  <Skeleton variant="rounded" height={210} sx={{ borderRadius: 3, mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="30%" height={22} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="40%" height={26} sx={{ mt: 2 }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Estado Vacío */}
        {!cargando && filtrados.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              bgcolor: "#FFFFFF",
              borderRadius: 5,
              border: "1px dashed #CBD5E1",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)"
            }}
          >
            <SearchOffRoundedIcon sx={{ fontSize: 56, color: "#94A3B8", mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#163050", mb: 1 }}>
              No se encontraron servicios
            </Typography>
            <Typography sx={{ color: PALETTE.textMuted, maxWidth: 440, mx: "auto", mb: 3 }}>
              No hay servicios que coincidan con la categoría o término buscado. Intenta con otro filtro.
            </Typography>
            <Button
              onClick={() => setFiltroCat("Todas")}
              variant="contained"
              sx={{
                bgcolor: "#163050",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                "&:hover": { bgcolor: "#0F172A" }
              }}
            >
              Ver todas las categorías
            </Button>
          </Box>
        )}

        {/* Grid de Servicios Pro */}
        {!cargando && filtrados.length > 0 && (
          <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
            {filtrados.map((s, idx) => {
              const imgSrc = resolveServicioImagenUrl(s.imagenUrl, API_URL);
              const imgFailed = Boolean(imgErrorById[s.id]);
              const precioFormateado = s.precio != null ? `$${Number(s.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "A consultar";

              return (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(idx * 0.07, 0.6),
                      ease: "easeOut"
                    }}
                    whileHover={{ y: -8 }}
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "20px",
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(226, 232, 240, 0.9)",
                      boxShadow: "0 10px 30px -8px rgba(15, 23, 42, 0.08)",
                      overflow: "hidden",
                      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        borderColor: "rgba(212, 175, 55, 0.6)",
                        boxShadow: "0 22px 50px -10px rgba(22, 48, 80, 0.16)",
                        "& .service-card-img": {
                          transform: "scale(1.08)"
                        },
                        "& .service-reserve-btn": {
                          bgcolor: "#D4AF37",
                          color: "#163050",
                          transform: "translateX(2px)"
                        }
                      }
                    }}
                  >
                    {/* Contenedor de la Imagen con Aspect Ratio 4:3 y Overlay */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 220,
                        width: "100%",
                        overflow: "hidden",
                        bgcolor: "#0F172A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {imgSrc && !imgFailed ? (
                        <CardMedia
                          component="img"
                          image={imgSrc}
                          alt={s.nombre}
                          className="service-card-img"
                          onError={() => setImgErrorById((prev) => ({ ...prev, [s.id]: true }))}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)"
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            color: "rgba(255, 255, 255, 0.5)"
                          }}
                        >
                          <ContentCutRoundedIcon sx={{ fontSize: 44, color: "#D4AF37" }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Lady Barber</Typography>
                        </Box>
                      )}

                      {/* Gradiente sutil inferior sobre la imagen */}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(15,23,42,0.65) 100%)",
                          pointerEvents: "none"
                        }}
                      />

                      {/* Badge de Categoría Flotante */}
                      {s.categoria && (
                        <Chip
                          label={s.categoria}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "rgba(22, 48, 80, 0.85)",
                            backdropFilter: "blur(8px)",
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            letterSpacing: "0.04em",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
                          }}
                        />
                      )}

                      {/* Badge de Precio Flotante */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          right: 12,
                          bgcolor: "#D4AF37",
                          color: "#163050",
                          fontWeight: 900,
                          fontSize: "0.95rem",
                          px: 1.5,
                          py: 0.4,
                          borderRadius: "10px",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5
                        }}
                      >
                        {precioFormateado}
                      </Box>
                    </Box>

                    {/* Contenido de la Tarjeta */}
                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 800,
                          color: "#163050",
                          fontFamily: "'Playfair Display', 'Georgia', serif",
                          fontSize: "1.2rem",
                          mb: 1,
                          lineHeight: 1.35,
                          minHeight: "2.7em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {s.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: PALETTE.textMuted,
                          fontSize: "0.9rem",
                          lineHeight: 1.6,
                          mb: 3,
                          flexGrow: 1,
                          minHeight: "3.2em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {s.descripcion || "Servicio profesional personalizado con los más altos estándares de calidad."}
                      </Typography>

                      {/* Botón Agendar Cita */}
                      <Button
                        component={RouterLink}
                        to="/login"
                        className="service-reserve-btn"
                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
                        fullWidth
                        sx={{
                          bgcolor: "#F1F5F9",
                          color: "#163050",
                          fontWeight: 800,
                          fontSize: "0.88rem",
                          py: 1.1,
                          borderRadius: "12px",
                          textTransform: "none",
                          transition: "all 0.25s ease",
                          boxShadow: "none"
                        }}
                      >
                        Reservar este servicio
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default PaginaCatalogoPublico;
