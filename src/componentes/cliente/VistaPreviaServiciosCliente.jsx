import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import api from "../../api";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";

function moneyMXN(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function VistaPreviaServiciosCliente({ maxItems = 3 }) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [imgErrorById, setImgErrorById] = useState({});

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargando(true);
        const { data } = await api.get("/api/servicios");
        if (cancel) return;
        setServicios(Array.isArray(data) ? data : []);
      } catch {
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

  const items = useMemo(() => servicios.slice(0, Math.max(0, maxItems)), [servicios, maxItems]);

  return (
    <GlassCard elevation={0} sx={{ mt: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <StorefrontRounded sx={{ color: alpha(P.accent, 0.95) }} />
              <Typography sx={{ fontWeight: 900, color: P.primary, fontSize: "1.05rem" }}>
                Servicios destacados
              </Typography>
            </Stack>
          </Box>
          <Button
            onClick={() => navigate("/cliente/servicios")}
            variant="contained"
            sx={{ fontWeight: 800, bgcolor: P.navy, "&:hover": { bgcolor: "#122947" } }}
          >
            Ver todos
          </Button>
        </Stack>

        {cargando ? (
          <Grid container spacing={2}>
            {Array.from({ length: Math.min(3, Math.max(1, maxItems)) }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <GlassCard elevation={0} sx={{ borderRadius: 4, overflow: "hidden" }}>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton width="70%" />
                    <Skeleton width="45%" />
                    <Skeleton width="90%" />
                  </CardContent>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        ) : items.length === 0 ? (
          <Typography sx={{ color: P.secondary }}>Aún no hay servicios para mostrar.</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((s) => {
              const imgSrc = resolveServicioImagenUrl(s.imagenUrl, api.defaults.baseURL);
              const imgFailed = Boolean(imgErrorById[s.id]);
              const price = moneyMXN(s.precio);

              return (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <GlassCard
                    elevation={0}
                    sx={{ height: "100%", borderRadius: 4, overflow: "hidden" }}
                  >
                    {imgSrc && !imgFailed ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={s.nombre}
                        onError={() => setImgErrorById((prev) => ({ ...prev, [s.id]: true }))}
                        sx={{
                          width: "100%",
                          height: 140,
                          objectFit: "contain",
                          objectPosition: "center",
                          display: "block",
                          bgcolor: "#F1F5F9",
                          p: 1
                        }}
                      />
                    ) : (
                      <Box sx={{ height: 140, bgcolor: P.border }} aria-hidden />
                    )}

                    <CardContent>
                      <Typography sx={{ fontWeight: 900, color: P.primary }}>{s.nombre}</Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        {s.categoria ? (
                          <Chip
                            label={s.categoria}
                            size="small"
                            sx={{
                              bgcolor: alpha(P.accent, 0.16),
                              color: alpha(P.accent, 0.95),
                              fontWeight: 800
                            }}
                          />
                        ) : null}
                        {price ? (
                          <Chip
                            label={price}
                            size="small"
                            sx={{
                              bgcolor: alpha(P.navy, 0.10),
                              color: P.navy,
                              fontWeight: 900
                            }}
                          />
                        ) : null}
                      </Stack>

                      <Typography
                        sx={{
                          color: P.secondary,
                          mt: 1.1,
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {s.descripcion || "—"}
                      </Typography>

                      <Button
                        fullWidth
                        onClick={() => navigate("/cliente/citas")}
                        variant="outlined"
                        sx={{
                          mt: 2,
                          fontWeight: 800,
                          borderColor: P.navy,
                          color: P.navy,
                          "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.06) }
                        }}
                      >
                        Reservar
                      </Button>
                    </CardContent>
                  </GlassCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </GlassCard>
  );
}

