import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import BarberPole from "../compartidos/BarberPole";
import AdminPageShell from "../../ui/admin/AdminPageShell";
import AdminHeader from "../../ui/admin/AdminHeader";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";

const API_URL = "http://localhost:4000";

function ServiciosCliente() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [imgErrorById, setImgErrorById] = useState({});

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/servicios`, {
          barberHeadline: "Servicios",
          barberMessage: "Cargando el catálogo del salón…"
        });
        if (!cancel && Array.isArray(data)) setServicios(data);
      } catch (e) {
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

  const filtrados = useMemo(() => {
    if (filtroCat === "Todas") return servicios;
    return servicios.filter((s) => String(s.categoria || "").trim() === filtroCat);
  }, [servicios, filtroCat]);

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Área cliente"
        title="Servicios"
        subtitle="Cortes, barba y más: explora el catálogo y elige lo que necesitas para tu próxima visita."
        icon={<StorefrontRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        showBarberiaChip={true}
        right={<BarberPole size={42} width={11} sx={{ display: { xs: "none", sm: "flex" } }} />}
      />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            select
            size="small"
            label="Categoría"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
            sx={{ minWidth: 240, bgcolor: "#fff", borderRadius: 2 }}
          >
            {categorias.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {cargando && <Typography sx={{ color: P.secondary }}>Cargando…</Typography>}

        {!cargando && filtrados.length === 0 && (
          <Typography sx={{ color: P.secondary }}>No hay servicios para mostrar.</Typography>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {filtrados.map((s) => {
            const imgSrc = resolveServicioImagenUrl(s.imagenUrl, API_URL);
            const imgFailed = Boolean(imgErrorById[s.id]);
            return (
              <Grid item xs={12} sm={6} md={4} key={s.id}>
                <GlassCard
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    overflow: "hidden"
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
                      sx={{ objectFit: "cover", bgcolor: "#F1F5F9" }}
                    />
                  ) : (
                    <Box sx={{ height: 160, bgcolor: P.border }} aria-hidden />
                  )}
                  <CardContent>
                    <Typography sx={{ fontWeight: 900, color: P.primary }}>{s.nombre}</Typography>
                    {s.categoria && (
                      <Chip
                        label={s.categoria}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: alpha(P.accent, 0.16),
                          color: alpha(P.accent, 0.95),
                          fontWeight: 800
                        }}
                      />
                    )}
                    <Typography sx={{ color: P.secondary, mt: 1, fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {s.descripcion || "—"}
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, mt: 1 }}>
                      {s.precio != null ? `$${Number(s.precio).toFixed(2)}` : "Consultar precio"}
                    </Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
    </AdminPageShell>
  );
}

export default ServiciosCliente;
