import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Skeleton,
  Chip,
  Alert,
  Stack,
  Button,
  IconButton,
  Divider,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ShoppingCartRounded,
  AddRounded,
  RemoveRounded,
  DeleteRounded,
  SearchRounded
} from "@mui/icons-material";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import Swal from "sweetalert2";
import api from "../../api";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function VentasProductosRecepcion() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Carrito de compras
  const [cart, setCart] = useState([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [confirmandoVenta, setConfirmandoVenta] = useState(false);

  const hoyStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Cargar catálogo de insumos/productos
  useEffect(() => {
    let cancel = false;
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError("");
        // Query para incluir todos (solo activos)
        const { data } = await api.get("/api/insumos", {
          params: { incluirInactivos: 0 }
        });
        if (!cancel) {
          // Filtrar activos
          const arr = Array.isArray(data) ? data : [];
          setProductos(arr.filter((p) => p.estaActivo === 1));
        }
      } catch (e) {
        if (!cancel) {
          setError("No se pudo cargar el catálogo de productos.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchProductos();
    return () => {
      cancel = true;
    };
  }, [refreshCount]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase().trim();
    return productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q)
    );
  }, [productos, searchQuery]);

  // Sumar al carrito
  const addToCart = (product) => {
    const stock = Number(product.stockActual);
    if (stock <= 0) {
      Swal.fire("Sin stock", "Este producto está temporalmente agotado.", "warning");
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx > -1) {
        const item = prev[idx];
        if (item.cantidad >= stock) {
          Swal.fire("Límite de Stock", `Solo quedan ${stock} unidades de este producto.`, "warning");
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...item, cantidad: item.cantidad + 1 };
        return next;
      } else {
        return [...prev, { ...product, cantidad: 1 }];
      }
    });
  };

  // Restar del carrito
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === productId);
      if (idx === -1) return prev;
      const item = prev[idx];
      if (item.cantidad <= 1) {
        return prev.filter((it) => it.id !== productId);
      }
      const next = [...prev];
      next[idx] = { ...item, cantidad: item.cantidad - 1 };
      return next;
    });
  };

  // Eliminar elemento del carrito
  const deleteItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Suma total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.precioUnitario || 0) * item.cantidad, 0);
  }, [cart]);

  // Confirmar y procesar venta física en salón
  const handleConfirmarVenta = async () => {
    if (cart.length === 0) {
      Swal.fire("Carrito vacío", "Agrega al menos un producto al carrito.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "¿Registrar Venta?",
      text: `Se cobrarán ${moneyMXN(cartTotal)} recibidos mediante ${metodoPago}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cobrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#64748B"
    });

    if (!result.isConfirmed) return;

    try {
      setConfirmandoVenta(true);

      // 1. Descontar stock de la base de datos para cada producto
      for (const item of cart) {
        const nuevoStock = Number(item.stockActual) - item.cantidad;
        
        // PUT /api/insumos/:id para actualizar stockActual
        await api.put(`/api/insumos/${item.id}`, {
          stockActual: nuevoStock
        });
      }

      // 2. Registrar venta localmente para control de caja diaria
      const ventaKey = "ventas_hoy_" + hoyStr;
      const ventasExistentes = JSON.parse(localStorage.getItem(ventaKey) || "[]");
      
      const nuevaVenta = {
        id: Date.now(),
        tipo: "PRODUCTO",
        total: cartTotal,
        metodoPago,
        items: cart.map((it) => ({
          nombre: it.nombre,
          cantidad: it.cantidad,
          precio: it.precioUnitario
        })),
        fecha: new Date().toLocaleTimeString("es-MX", { hour12: false })
      };

      localStorage.setItem(ventaKey, JSON.stringify([...ventasExistentes, nuevaVenta]));

      // Modal de éxito
      await Swal.fire({
        title: "Venta Registrada",
        text: `La transacción se procesó exitosamente.`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Imprimir Comprobante",
        cancelButtonText: "Terminar",
        confirmButtonColor: "#1E3A5F",
        cancelButtonColor: "#64748B"
      }).then((res) => {
        if (res.isConfirmed) {
          // Simulación de impresión de ticket
          Swal.fire("Impresión", "Enviando ticket a la impresora térmica de recepción...", "success");
        }
      });

      // Resetear estados
      setCart([]);
      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      Swal.fire({
        title: "Error de Inventario",
        text: "No se pudo actualizar el stock del producto en base de datos. Reintenta.",
        icon: "error"
      });
    } finally {
      setConfirmandoVenta(false);
    }
  };

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease" }}>
      {/* Cabecera */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#1E3A5F",
            fontFamily: '"Cinzel", ui-serif, Georgia, serif',
            letterSpacing: "-0.01em"
          }}
        >
          Venta de Productos
        </Typography>
        <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
          Punto de venta (POS) y control de stock físico del salón.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3.5}>
        {/* Catálogo de Productos */}
        <Grid item xs={12} md={7.5}>
          <GlassCard elevation={0} sx={{ p: 2.5, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar producto por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchRounded sx={{ color: P.secondary, mr: 1, fontSize: 20 }} />
              }}
            />
          </GlassCard>

          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <GlassCard elevation={0} sx={{ p: 2, display: "flex", gap: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="70%" />
                      <Skeleton width="40%" sx={{ mt: 1 }} />
                    </Box>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          ) : productosFiltrados.length === 0 ? (
            <GlassCard elevation={0} sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ color: P.secondary, fontWeight: 700 }}>
                No se encontraron productos en el inventario.
              </Typography>
            </GlassCard>
          ) : (
            <Grid container spacing={2}>
              {productosFiltrados.map((p) => {
                const stock = Number(p.stockActual);
                const isLow = stock <= Number(p.stockMinimo);
                const isAgotado = stock <= 0;
                const imgSrc = p.imagen ? resolveServicioImagenUrl(p.imagen, api.defaults.baseURL) : null;

                return (
                  <Grid item xs={12} sm={6} key={p.id}>
                    <GlassCard
                      elevation={0}
                      sx={{
                        p: 2,
                        display: "flex",
                        gap: 2,
                        height: "100%",
                        opacity: isAgotado ? 0.65 : 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: isAgotado ? P.border : alpha(P.accent, 0.4),
                          transform: isAgotado ? "none" : "translateY(-2px)"
                        }
                      }}
                    >
                      {/* Imagen */}
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: "#F1F5F9",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {imgSrc ? (
                          <Box
                            component="img"
                            src={imgSrc}
                            alt={p.nombre}
                            sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 800 }}>
                            SIN FOTO
                          </Typography>
                        )}
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <Box>
                          <Typography noWrap sx={{ fontWeight: 900, color: P.navy, fontSize: "0.9rem" }}>
                            {p.nombre}
                          </Typography>
                          <Typography sx={{ color: "#22C55E", fontWeight: 900, fontSize: "0.85rem", mt: 0.25 }}>
                            {moneyMXN(p.precioUnitario)}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                          {isAgotado ? (
                            <Chip
                              label="Agotado"
                              size="small"
                              sx={{ bgcolor: alpha(P.red, 0.1), color: P.red, fontWeight: 800, fontSize: "0.68rem" }}
                            />
                          ) : (
                            <Chip
                              label={`Stock: ${stock}`}
                              size="small"
                              sx={{
                                bgcolor: isLow ? alpha("#F59E0B", 0.12) : alpha("#22C55E", 0.1),
                                color: isLow ? "#B45309" : "#15803D",
                                fontWeight: 800,
                                fontSize: "0.68rem"
                              }}
                            />
                          )}
                          {!isAgotado && (
                            <IconButton
                              size="small"
                              onClick={() => addToCart(p)}
                              sx={{
                                ml: "auto !important",
                                bgcolor: P.navy,
                                color: "#FFFFFF",
                                p: 0.5,
                                "&:hover": { bgcolor: "#152a41" }
                              }}
                            >
                              <AddRounded sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Stack>
                      </Box>
                    </GlassCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Grid>

        {/* Carrito de Cobro */}
        <Grid item xs={12} md={4.5}>
          <GlassCard elevation={0} sx={{ position: "sticky", top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Header Carrito */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                <ShoppingCartRounded sx={{ color: P.accent }} />
                <Typography variant="h6" sx={{ color: P.primary, fontWeight: 900, fontFamily: '"Cinzel", serif' }}>
                  Carrito de Caja
                </Typography>
                <Chip
                  label={`${cart.reduce((sum, item) => sum + item.cantidad, 0)} items`}
                  size="small"
                  sx={{ ml: "auto", fontWeight: 800, bgcolor: alpha(P.navy, 0.1), color: P.navy }}
                />
              </Stack>

              {/* Contenido Carrito */}
              {cart.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center", color: P.secondary }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                    El carrito está vacío.
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", mt: 0.5 }}>
                    Agrega productos del catálogo para iniciar el cobro.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {/* Lista de Items */}
                  <Box sx={{ maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
                    <Table size="small" disablePadding>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.id} sx={{ "& td": { py: 1, px: 0.5, borderBottom: "1px solid #F1F5F9" } }}>
                            <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.8rem", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.nombre}
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.25 }}>
                                  <RemoveRounded sx={{ fontSize: 14 }} />
                                </IconButton>
                                <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", px: 0.5 }}>
                                  {item.cantidad}
                                </Typography>
                                <IconButton size="small" onClick={() => addToCart(item)} sx={{ p: 0.25 }}>
                                  <AddRounded sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
                              {moneyMXN(Number(item.precioUnitario) * item.cantidad)}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => deleteItem(item.id)} sx={{ color: P.red, p: 0.25 }}>
                                <DeleteRounded sx={{ fontSize: 15 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <Divider />

                  {/* Método de pago */}
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
                    <Select
                      labelId="metodo-pago-label"
                      value={metodoPago}
                      label="Método de Pago"
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TARJETA">Tarjeta (Débito/Crédito)</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia bancaria</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Totales */}
                  <Stack spacing={1} sx={{ mt: 1, py: 1.5, px: 2, bgcolor: alpha(P.pageBg, 0.4), borderRadius: 2.5, border: `1px solid ${P.border}` }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ fontSize: "0.85rem", color: P.secondary, fontWeight: 700 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{moneyMXN(cartTotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ fontSize: "1rem", color: P.navy, fontWeight: 900 }}>
                      <Typography>Total Recibido:</Typography>
                      <Typography sx={{ color: "#22C55E" }}>{moneyMXN(cartTotal)}</Typography>
                    </Stack>
                  </Stack>

                  {/* Botón Cobrar */}
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={confirmandoVenta}
                    onClick={handleConfirmarVenta}
                    sx={{
                      bgcolor: "#1E3A5F",
                      color: "#FFFFFF",
                      fontWeight: 900,
                      textTransform: "none",
                      py: 1.25,
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(30, 58, 95, 0.15)",
                      "&:hover": { bgcolor: "#152a41" }
                    }}
                  >
                    {confirmandoVenta ? "Registrando..." : "Registrar y Cobrar Venta"}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
