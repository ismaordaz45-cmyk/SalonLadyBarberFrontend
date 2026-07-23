import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Skeleton,
  Grid
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SparklesIcon from "@mui/icons-material/AutoFixHighRounded";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import api from "../../api";
import { simularExtraccionRecomendaciones } from "../../servicios/recomendacionesService";

function moneyMXN(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function RecomendacionesProductosCliente({
  cart = [],
  todosLosProductos = [],
  onAddToCart,
  variant = "cartModal" // 'cartModal' | 'inlineBanner'
}) {
  const [recomendados, setRecomendados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [agregados, setAgregados] = useState({});

  useEffect(() => {
    let cancel = false;
    const runAI = async () => {
      try {
        setCargando(true);
        const data = await simularExtraccionRecomendaciones(cart, todosLosProductos, 3);
        if (!cancel) {
          setRecomendados(data);
        }
      } catch (err) {
        if (!cancel) setRecomendados([]);
      } finally {
        if (!cancel) setCargando(false);
      }
    };

    runAI();
    return () => {
      cancel = true;
    };
  }, [cart, todosLosProductos]);

  const handleAdd = (prod) => {
    if (onAddToCart) onAddToCart(prod);
    setAgregados((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [prod.id]: false }));
    }, 1800);
  };

  if (!cargando && recomendados.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 2.5,
        pt: 2,
        pb: 2,
        px: 2,
        borderRadius: 3,
        bgcolor: alpha(P.navy, 0.03),
        border: `1px dashed ${alpha(P.navy, 0.2)}`,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Encabezado de recomendaciones */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justify: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: alpha(P.accent, 0.2),
            color: P.oscuro
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", color: P.navy }}>
          Recomendado para tu carrito
        </Typography>
        <Chip
          label="Sugerencia Inteligente"
          size="small"
          icon={<SparklesIcon sx={{ fontSize: "12px !important", color: `${P.oscuro} !important` }} />}
          sx={{
            ml: "auto !important",
            bgcolor: alpha(P.accent, 0.15),
            color: P.oscuro,
            fontWeight: 800,
            fontSize: "0.68rem"
          }}
        />
      </Stack>

      <Typography variant="caption" sx={{ color: P.secondary, display: "block", mb: 2, fontWeight: 600 }}>
        Productos frecuentemente combinados según patrones de compra
      </Typography>

      {/* Lista de productos recomendados */}
      {cargando ? (
        <Stack direction="row" spacing={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" width={140} height={120} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : (
        <Grid container spacing={1.5}>
          {recomendados.map((item) => {
            const isAdded = agregados[item.id];
            const imgSrc = item?.imagen
              ? resolveServicioImagenUrl(item.imagen, api.defaults.baseURL)
              : null;
            const price = moneyMXN(item.precioUnitario);

            return (
              <Grid item xs={12} sm={4} key={item.id}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${alpha(P.navy, 0.1)}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "all 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                    height: "100%",
                    "&:hover": {
                      borderColor: alpha(P.accent, 0.5),
                      boxShadow: `0 6px 16px ${alpha(P.navy, 0.08)}`,
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  {/* Badge de afinidad */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Chip
                      label={item.coincidenciaPorcentaje}
                      size="small"
                      sx={{
                        bgcolor: alpha("#22C55E", 0.12),
                        color: "#15803D",
                        fontWeight: 900,
                        fontSize: "0.65rem",
                        height: 20
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: 800, color: P.navy }}>
                      {price}
                    </Typography>
                  </Box>

                  {/* Foto e información */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={item.nombre}
                        sx={{
                          width: 44,
                          height: 44,
                          objectFit: "contain",
                          borderRadius: 1.5,
                          bgcolor: "#F8FAFC",
                          p: 0.5,
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          bgcolor: "#F1F5F9",
                          flexShrink: 0
                        }}
                      />
                    )}

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        noWrap
                        sx={{ fontWeight: 800, fontSize: "0.82rem", color: P.navy }}
                        title={item.nombre}
                      >
                        {item.nombre}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: P.secondary,
                          fontSize: "0.68rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {item.tagRecomendacion}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Botón de añadir rápido */}
                  <Button
                    fullWidth
                    size="small"
                    variant={isAdded ? "contained" : "outlined"}
                    color={isAdded ? "success" : "primary"}
                    onClick={() => handleAdd(item)}
                    startIcon={isAdded ? <CheckCircleRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      borderRadius: 1.5,
                      py: 0.5,
                      textTransform: "none",
                      borderColor: alpha(P.navy, 0.3),
                      color: isAdded ? "#fff" : P.navy,
                      bgcolor: isAdded ? "#22C55E" : "transparent",
                      "&:hover": {
                        bgcolor: isAdded ? "#16a34a" : alpha(P.navy, 0.06),
                        borderColor: P.navy
                      }
                    }}
                  >
                    {isAdded ? "¡Agregado!" : "Agregar al carrito"}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
