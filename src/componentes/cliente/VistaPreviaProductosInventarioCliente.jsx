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
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import AddRounded from "@mui/icons-material/AddRounded";
import api from "../../api";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import { useCart } from "../../context/CartContext";

function moneyMXN(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function VistaPreviaProductosInventarioCliente({ maxItems = 6 }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargando(true);
        const { data } = await api.get("/api/insumos", {
          params: { incluirInactivos: 0 }
        });
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

  const items = useMemo(
    () => productos.slice(0, Math.max(0, maxItems)),
    [productos, maxItems]
  );

  const goToCatalog = () => navigate("/cliente/productos");

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
              <Inventory2Rounded sx={{ color: alpha(P.accent, 0.95) }} />
              <Typography sx={{ fontWeight: 900, color: P.primary, fontSize: "1.05rem" }}>
                Productos del inventario
              </Typography>
            </Stack>
          </Box>
          <Button
            onClick={goToCatalog}
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
                    <Skeleton width="60%" />
                  </CardContent>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        ) : items.length === 0 ? (
          <Typography sx={{ color: P.secondary }}>Aún no hay productos activos para mostrar.</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((p) => {
              const imgSrc = p?.imagen
                ? resolveServicioImagenUrl(p.imagen, api.defaults.baseURL)
                : null;
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
                          height: 140,
                          objectFit: "contain",
                          objectPosition: "center",
                          display: "block",
                          bgcolor: "#F1F5F9",
                          p: 1
                        }}
                        onError={(e) => {
                          // evita loops de error dejando un placeholder
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Box sx={{ height: 140, bgcolor: P.border }} aria-hidden />
                    )}

                    <CardContent>
                      <Typography sx={{ fontWeight: 900, color: P.primary }}>
                        {p.nombre}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
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

                      <Button
                        fullWidth
                        startIcon={<AddRounded />}
                        variant="contained"
                        onClick={() => addToCart(p)}
                        disabled={stock <= 0}
                        sx={{
                          mt: 2,
                          fontWeight: 900,
                          bgcolor: P.navy,
                          color: "#fff",
                          "&:hover": { bgcolor: alpha(P.navy, 0.9) }
                        }}
                      >
                        {stock <= 0 ? "Sin Stock" : "Agregar"}
                      </Button>

                      <Button
                        onClick={goToCatalog}
                        variant="text"
                        fullWidth
                        sx={{
                          mt: 1,
                          fontWeight: 800,
                          color: P.primary,
                          "&:hover": { bgcolor: alpha(P.primary, 0.06) }
                        }}
                      >
                        Ver catálogo
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

