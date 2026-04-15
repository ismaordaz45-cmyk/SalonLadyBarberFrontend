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
  Typography
} from "@mui/material";
import { resolveServicioImagenUrl } from "../utils/resolveServicioImagenUrl";

const API_URL = "http://localhost:4000";

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

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [imgErrorById, setImgErrorById] = useState({});
  const [showCards, setShowCards] = useState(false);

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

  useEffect(() => {
    if (cargando) return;
    const t = setTimeout(() => setShowCards(true), 60);
    return () => clearTimeout(t);
  }, [cargando]);

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
    if (filtroCat === "Todas") return servicios;
    return servicios.filter((s) => String(s.categoria || "").trim() === filtroCat);
  }, [servicios, filtroCat]);

  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        "@keyframes slb-riseIn": {
          "0%": { opacity: 0, transform: "translateY(14px) scale(0.992)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: PALETTE.text, fontWeight: 700, flex: "1 1 auto" }}>
            Servicios
          </Typography>
          <Button component={RouterLink} to="/" variant="outlined" sx={{ textTransform: "none", borderColor: PALETTE.primary, color: PALETTE.primary }}>
            Volver al inicio
          </Button>
        </Box>

        <TextField
          select
          size="small"
          label="Categoría"
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)}
          sx={{ minWidth: 220, mb: 3, bgcolor: PALETTE.card }}
        >
          {categorias.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        {cargando && (
          <Typography sx={{ color: PALETTE.textMuted }}>Cargando…</Typography>
        )}

        {!cargando && filtrados.length === 0 && (
          <Typography sx={{ color: PALETTE.textMuted }}>No hay servicios para mostrar.</Typography>
        )}

        <Grid container spacing={2}>
          {filtrados.map((s, idx) => {
            const imgSrc = resolveServicioImagenUrl(s.imagenUrl, API_URL);
            const imgFailed = Boolean(imgErrorById[s.id]);
            return (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: 2,
                  bgcolor: PALETTE.card,
                  overflow: "hidden",
                  transform: showCards ? "none" : "translateY(12px)",
                  opacity: showCards ? 1 : 0,
                  animation: showCards ? "slb-riseIn 650ms cubic-bezier(0.2,0.8,0.2,1) both" : "none",
                  animationDelay: `${Math.min(idx, 8) * 70}ms`,
                  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 22px 60px rgba(15, 23, 42, 0.16)",
                    borderColor: "rgba(30, 41, 59, 0.35)"
                  }
                }}
              >
                {imgSrc && !imgFailed ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={imgSrc}
                    alt={s.nombre}
                    onError={() =>
                      setImgErrorById((prev) => ({ ...prev, [s.id]: true }))
                    }
                    sx={{
                      objectFit: "contain",
                      objectPosition: "center",
                      bgcolor: PALETTE.pageBg,
                      filter: "saturate(1.04) contrast(1.04)",
                      p: 1
                    }}
                  />
                ) : (
                  <Box sx={{ height: 160, bgcolor: PALETTE.border }} aria-hidden />
                )}
                <CardContent>
                  <Typography sx={{ fontWeight: 700, color: PALETTE.text }}>{s.nombre}</Typography>
                  {s.categoria && (
                    <Chip label={s.categoria} size="small" sx={{ mt: 1, bgcolor: PALETTE.pageBg, color: PALETTE.textMuted }} />
                  )}
                  <Typography sx={{ color: PALETTE.textMuted, mt: 1, fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {s.descripcion || "—"}
                  </Typography>
                  <Typography sx={{ color: PALETTE.text, fontWeight: 600, mt: 1 }}>
                    {s.precio != null ? `$${Number(s.precio).toFixed(2)}` : "Consultar precio"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default PaginaCatalogoPublico;
