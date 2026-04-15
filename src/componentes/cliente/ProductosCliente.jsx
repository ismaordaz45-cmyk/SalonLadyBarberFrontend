import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import AdminPageShell from "../../ui/admin/AdminPageShell";
import AdminHeader from "../../ui/admin/AdminHeader";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";

function moneyMXN(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function ProductosCliente() {
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargando(true);
        const { data } = await api.get("/api/insumos", { params: { incluirInactivos: 0 } });
        if (cancel) return;
        const arr = Array.isArray(data) ? data : [];
        setProductos(arr.filter((p) => p?.estaActivo === 1));
      } catch {
        if (!cancel) setProductos([]);
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const filtrados = useMemo(() => {
    const query = String(q || "").trim().toLowerCase();
    if (!query) return productos;
    return productos.filter((p) => {
      const nombre = String(p?.nombre || "").toLowerCase();
      const desc = String(p?.descripcion || "").toLowerCase();
      return nombre.includes(query) || desc.includes(query);
    });
  }, [productos, q]);

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Área cliente"
        title="Productos"
        subtitle="Catálogo de productos del salón (carrito en preparación)."
        icon={<Inventory2Rounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        showBarberiaChip={true}
      />

      <GlassCard elevation={0} sx={{ borderRadius: 4, mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              placeholder="Buscar producto…"
              sx={{ minWidth: { xs: "100%", md: 380 }, bgcolor: "#fff", borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: alpha(P.secondary, 0.9) }} />
                  </InputAdornment>
                )
              }}
            />
            <Chip
              label="Carrito: Próximamente"
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                bgcolor: alpha(P.accent, 0.14),
                color: alpha(P.accent, 0.95),
                fontWeight: 900
              }}
            />
          </Stack>
        </CardContent>
      </GlassCard>

      {cargando ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <GlassCard elevation={0} sx={{ borderRadius: 4, overflow: "hidden" }}>
                <Skeleton variant="rectangular" height={150} />
                <CardContent>
                  <Skeleton width="70%" />
                  <Skeleton width="45%" />
                  <Skeleton width="90%" />
                  <Skeleton width="60%" />
                </CardContent>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      ) : filtrados.length === 0 ? (
        <Typography sx={{ color: P.secondary }}>
          No hay productos para mostrar.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filtrados.map((p) => {
            const imgSrc = p?.imagen ? resolveServicioImagenUrl(p.imagen, api.defaults.baseURL) : null;
            const price = moneyMXN(p?.precioUnitario);
            const stock = Number(p?.stockActual);
            const stockMin = Number(p?.stockMinimo);
            const isLow = Number.isFinite(stock) && Number.isFinite(stockMin) && stock < stockMin;

            return (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <GlassCard
                  elevation={0}
                  sx={{ height: "100%", borderRadius: 4, overflow: "hidden" }}
                >
                  {imgSrc ? (
                    <Box
                      component="img"
                      src={imgSrc}
                      alt={p.nombre}
                      sx={{
                        width: "100%",
                        height: 150,
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                        bgcolor: "#F1F5F9",
                        p: 1
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Box sx={{ height: 150, bgcolor: P.border }} aria-hidden />
                  )}

                  <CardContent>
                    <Typography sx={{ fontWeight: 900, color: P.primary }}>{p.nombre}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      {price ? (
                        <Chip
                          label={price}
                          size="small"
                          sx={{ bgcolor: alpha(P.navy, 0.10), color: P.navy, fontWeight: 900 }}
                        />
                      ) : null}
                      {Number.isFinite(stock) ? (
                        <Chip
                          label={isLow ? `Stock bajo: ${stock}` : `Stock: ${stock}`}
                          size="small"
                          sx={{
                            bgcolor: isLow ? alpha("#F59E0B", 0.16) : alpha("#22C55E", 0.14),
                            color: isLow ? "#B45309" : "#15803D",
                            fontWeight: 800
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
                      {p.descripcion || "—"}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        disabled
                        startIcon={<AddRounded />}
                        variant="outlined"
                        sx={{
                          fontWeight: 900,
                          borderColor: alpha(P.navy, 0.35),
                          color: alpha(P.navy, 0.65)
                        }}
                        title="Próximamente"
                      >
                        Agregar
                      </Button>
                      <Button
                        fullWidth
                        disabled
                        startIcon={<ShoppingCartRounded />}
                        variant="contained"
                        sx={{
                          fontWeight: 900,
                          bgcolor: alpha(P.navy, 0.35),
                          color: alpha("#FFFFFF", 0.9)
                        }}
                        title="Próximamente"
                      >
                        Carrito
                      </Button>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </AdminPageShell>
  );
}

