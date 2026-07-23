import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Skeleton
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import api from "../../api";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import { useCart } from "../../context/CartContext";

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function CarruselTePuedeInteresarCliente() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [tabActiva, setTabActiva] = useState(0); // 0: Servicios, 1: Productos
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState({});

  const scrollRef = useRef(null);

  useEffect(() => {
    let cancel = false;
    const loadData = async () => {
      try {
        setCargando(true);
        const [resServ, resProd] = await Promise.all([
          api.get("/api/servicios").catch(() => ({ data: [] })),
          api.get("/api/insumos", { params: { incluirInactivos: 0 } }).catch(() => ({ data: [] }))
        ]);

        if (cancel) return;

        const listServ = Array.isArray(resServ.data) ? resServ.data : [];
        const listProd = Array.isArray(resProd.data) ? resProd.data : [];

        setServicios(listServ);
        setProductos(listProd.filter((p) => p?.estaActivo === 1));
      } catch (err) {
        console.error("Error al cargar carrusel:", err);
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    loadData();
    return () => {
      cancel = true;
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddToCart = (prod) => {
    addToCart(prod);
    setAddedItemMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 1600);
  };

  return (
    <GlassCard
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 2.5, md: 3.5 },
        bgcolor: "#FFFFFF",
        border: `1px solid ${P.border}`,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Encabezado del Carrusel */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <AutoAwesomeRoundedIcon sx={{ color: P.accent, fontSize: 24 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: P.navy,
                fontFamily: '"Cinzel", ui-serif, Georgia, serif',
                fontSize: { xs: "1.3rem", md: "1.6rem" }
              }}
            >
              Te puede interesar
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: P.secondary, mt: 0.5, fontWeight: 600 }}>
            Descubre nuestros servicios estelares y productos más recomendados para ti.
          </Typography>
        </Box>

        {/* Pestañas Selectoras */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tabs
            value={tabActiva}
            onChange={(_, val) => setTabActiva(val)}
            sx={{
              bgcolor: alpha(P.navy, 0.05),
              p: 0.5,
              borderRadius: 2.5,
              minHeight: 36,
              "& .MuiTab-root": {
                fontWeight: 800,
                fontSize: "0.82rem",
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                minHeight: 32,
                color: P.secondary,
                transition: "all 0.25s ease"
              },
              "& .Mui-selected": {
                bgcolor: P.navy,
                color: "#FFFFFF !important"
              },
              "& .MuiTabs-indicator": { display: "none" }
            }}
          >
            <Tab
              icon={<StorefrontRoundedIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Servicios"
            />
            <Tab
              icon={<Inventory2RoundedIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Productos"
            />
          </Tabs>

          {/* Flechas de Navegación del Carrusel */}
          <IconButton
            size="small"
            onClick={() => handleScroll("left")}
            sx={{
              bgcolor: alpha(P.navy, 0.06),
              color: P.navy,
              "&:hover": { bgcolor: alpha(P.navy, 0.12) }
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleScroll("right")}
            sx={{
              bgcolor: alpha(P.navy, 0.06),
              color: P.navy,
              "&:hover": { bgcolor: alpha(P.navy, 0.12) }
            }}
          >
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Contenedor Carrusel Horizontal */}
      {cargando ? (
        <Stack direction="row" spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width={300} height={240} sx={{ borderRadius: 3, flexShrink: 0 }} />
          ))}
        </Stack>
      ) : (
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 2.5,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            pb: 1,
            pt: 0.5,
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {tabActiva === 0
            ? // LISTA DE SERVICIOS
              servicios.map((s) => {
                const imgSrc = s?.imagenUrl ? resolveServicioImagenUrl(s.imagenUrl, api.defaults.baseURL) : null;
                const price = moneyMXN(s.precio);

                return (
                  <Box
                    key={s.id}
                    sx={{
                      width: { xs: 260, sm: 300, md: 320 },
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                      borderRadius: 3.5,
                      border: `1px solid ${alpha(P.navy, 0.12)}`,
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 30px ${alpha(P.navy, 0.1)}`,
                        borderColor: alpha(P.accent, 0.6)
                      }
                    }}
                  >
                    {/* Imagen / Header */}
                    <Box sx={{ position: "relative", height: 140, bgcolor: "#F8FAFC" }}>
                      {imgSrc ? (
                        <Box
                          component="img"
                          src={imgSrc}
                          alt={s.nombre}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center"
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            bgcolor: alpha(P.navy, 0.08),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <StorefrontRoundedIcon sx={{ fontSize: 40, color: alpha(P.navy, 0.3) }} />
                        </Box>
                      )}
                      <Chip
                        label="Recomendado"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          bgcolor: alpha(P.accent, 0.95),
                          color: "#1E3A5F",
                          fontWeight: 900,
                          fontSize: "0.68rem"
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 900, color: P.navy, fontSize: "1rem", lineHeight: 1.3 }}>
                            {s.nombre}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, color: "#15803D", fontSize: "0.95rem" }}>
                            {price}
                          </Typography>
                        </Stack>

                        <Typography
                          sx={{
                            color: P.secondary,
                            fontSize: "0.82rem",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 2
                          }}
                        >
                          {s.descripcion || "Servicio profesional de cuidado y corte de alta definición."}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate("/cliente/citas")}
                        startIcon={<CalendarMonthRoundedIcon />}
                        sx={{
                          bgcolor: P.navy,
                          color: "#FFFFFF",
                          fontWeight: 900,
                          borderRadius: 2,
                          py: 0.9,
                          fontSize: "0.82rem",
                          textTransform: "none",
                          "&:hover": { bgcolor: "#122947" }
                        }}
                      >
                        Reservar Servicio
                      </Button>
                    </Box>
                  </Box>
                );
              })
            : // LISTA DE PRODUCTOS
              productos.map((p) => {
                const imgSrc = p?.imagen ? resolveServicioImagenUrl(p.imagen, api.defaults.baseURL) : null;
                const price = moneyMXN(p?.precioUnitario);
                const isAdded = addedItemMap[p.id];
                const stock = Number(p?.stockActual || 0);

                return (
                  <Box
                    key={p.id}
                    sx={{
                      width: { xs: 260, sm: 300, md: 320 },
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                      borderRadius: 3.5,
                      border: `1px solid ${alpha(P.navy, 0.12)}`,
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justify: "space-between",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 30px ${alpha(P.navy, 0.1)}`,
                        borderColor: alpha(P.accent, 0.6)
                      }
                    }}
                  >
                    {/* Imagen / Header */}
                    <Box sx={{ position: "relative", height: 140, bgcolor: "#F8FAFC", p: 1 }}>
                      {imgSrc ? (
                        <Box
                          component="img"
                          src={imgSrc}
                          alt={p.nombre}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center"
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            bgcolor: alpha(P.navy, 0.08),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Inventory2RoundedIcon sx={{ fontSize: 40, color: alpha(P.navy, 0.3) }} />
                        </Box>
                      )}
                      <Chip
                        label="Top Producto"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          bgcolor: alpha(P.navy, 0.9),
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: "0.68rem"
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                          <Typography sx={{ fontWeight: 900, color: P.navy, fontSize: "1rem", lineHeight: 1.3 }}>
                            {p.nombre}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, color: "#15803D", fontSize: "0.95rem" }}>
                            {price}
                          </Typography>
                        </Stack>

                        <Typography
                          sx={{
                            color: P.secondary,
                            fontSize: "0.82rem",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 2
                          }}
                        >
                          {p.descripcion || "Producto profesional para mantener tu estilo radiante."}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        disabled={stock <= 0}
                        variant={isAdded ? "contained" : "outlined"}
                        color={isAdded ? "success" : "primary"}
                        onClick={() => handleAddToCart(p)}
                        startIcon={isAdded ? <CheckCircleRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                        sx={{
                          fontWeight: 900,
                          borderRadius: 2,
                          py: 0.9,
                          fontSize: "0.82rem",
                          textTransform: "none",
                          borderColor: P.navy,
                          color: isAdded ? "#FFF" : P.navy,
                          bgcolor: isAdded ? "#22C55E" : "transparent",
                          "&:hover": {
                            bgcolor: isAdded ? "#16a34a" : alpha(P.navy, 0.06),
                            borderColor: P.navy
                          }
                        }}
                      >
                        {stock <= 0 ? "Sin Stock" : isAdded ? "¡En Carrito!" : "Agregar al Carrito"}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
        </Box>
      )}
    </GlassCard>
  );
}
