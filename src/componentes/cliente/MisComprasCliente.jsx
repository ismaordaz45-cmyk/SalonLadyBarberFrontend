import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ShoppingBagRounded from "@mui/icons-material/ShoppingBagRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import AdminPageShell from "../../ui/admin/AdminPageShell";
import AdminHeader from "../../ui/admin/AdminHeader";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import api from "../../api";
import Swal from "sweetalert2";
import { useCart } from "../../context/CartContext";
import { descargarTicketInsumosPDF } from "../../utils/ticketInsumosPDF";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";

const MotionBox = motion.create(Box);

function MisComprasCliente() {
  const { addToCart } = useCart();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [verTodas, setVerTodas] = useState(false);

  const fetchCompras = async () => {
    try {
      setCargando(true);
      const { data } = await api.get("/api/cliente/compras");
      setCompras(data || []);
    } catch (e) {
      console.error("Error al cargar historial de compras:", e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  function moneyMXN(value) {
    if (value == null || value === "") return "$0.00";
    const n = Number(value);
    if (!Number.isFinite(n)) return "$0.00";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
  }

  const handleVerComprobanteCompra = (compra) => {
    const total = Number(compra.total || 0);
    const dateStr = compra.fecha ? new Date(compra.fecha).toLocaleDateString("es-MX", { dateStyle: "long" }) : "—";
    const timeStr = compra.fecha ? new Date(compra.fecha).toLocaleTimeString("es-MX", { hour12: false }) : "—";

    Swal.fire({
      title: "Comprobante de Pago",
      html: `
        <div style="text-align: left; font-family: monospace; font-size: 0.85rem; line-height: 1.6; color: #334155;">
          <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="margin: 0; font-family: 'Cinzel', serif; font-weight: 900; font-size: 1.15rem; color: #1E3A5F;">LADY BARBER</h3>
            <span style="font-size: 0.75rem; color: #64748B; font-weight: 700;">ITZA D'M SALÓN</span>
            <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">TICKET COMPRA PRODUCTO</div>
            <div style="font-size: 0.68rem; color: #94A3B8;">Pedido ID: #${compra.id}</div>
          </div>

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>FECHA:</strong></span>
            <span>${dateStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>HORA:</strong></span>
            <span>${timeStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>ESTADO:</strong></span>
            <span style="color: #15803D; font-weight: 800; text-transform: uppercase;">PAGADO</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>REF MP:</strong></span>
            <span style="font-size: 0.72rem;">${compra.mp_payment_id || "—"}</span>
          </div>

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.75rem;">PRODUCTOS ADQUIRIDOS:</div>
          ${compra.items.map(it => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>• ${it.nombre} x${it.cantidad}</span>
              <span>${moneyMXN(it.precio_unitario * it.cantidad)}</span>
            </div>
          `).join('')}

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; margin-top: 8px;">
            <span>TOTAL PAGADO:</span>
            <span>${moneyMXN(total)}</span>
          </div>
          <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">Método de Pago: Tarjeta (Online / Mercado Pago)</div>

          <div style="text-align: center; margin-top: 25px; font-size: 0.72rem; color: #64748B; font-style: italic;">
            ¡Gracias por apoyar el salón Lady Barber!
          </div>
        </div>
      `,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1E3A5F"
    });
  };

  const handleComprarDeNuevo = (compra) => {
    try {
      (compra.items || []).forEach((item) => {
        addToCart({
          id: item.insumo_id,
          nombre: item.nombre,
          precioVenta: item.precio_unitario,
          imagen: item.imagen
        });
      });
      Swal.fire({
        icon: "success",
        title: "Productos Agregados",
        text: "Se han agregado todos los productos de este pedido a tu carrito de compras.",
        timer: 1800,
        showConfirmButton: false
      });
    } catch (e) {
      console.error("Error al volver a comprar:", e);
    }
  };

  // Filtrar las compras a mostrar según el estado 'verTodas'
  const comprasMostrar = useMemo(() => {
    if (verTodas) return compras;
    return compras.slice(0, 2);
  }, [compras, verTodas]);

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Área cliente"
        title="Mis Compras"
        subtitle="Administra tus pedidos de productos y descarga tus comprobantes."
        icon={<ShoppingBagRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        showBarberiaChip={true}
        right={
          <Button
            variant="outlined"
            size="small"
            onClick={fetchCompras}
            disabled={cargando}
            startIcon={<RefreshRounded sx={{ ...(cargando ? { animation: "spin 1.5s linear infinite" } : {}) }} />}
            sx={{
              borderColor: alpha(P.navy, 0.25),
              color: P.navy,
              fontWeight: 800,
              "&:hover": { borderColor: alpha(P.navy, 0.4), bgcolor: alpha(P.navy, 0.05) }
            }}
          >
            Actualizar
          </Button>
        }
      />

      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        <GlassCard elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: { xs: 2.25, md: 3.5 } }}>
            {cargando && compras.length === 0 ? (
              <Box sx={{ py: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5 }}>
                <RefreshRounded sx={{ fontSize: 26, color: P.navy, animation: "spin 1.5s linear infinite" }} />
                <Typography sx={{ color: P.secondary, fontSize: "0.92rem", fontWeight: 700 }}>Cargando tus compras...</Typography>
              </Box>
            ) : compras.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center" }}>
                <ShoppingBagRounded sx={{ fontSize: 56, color: P.secondary, opacity: 0.25, mb: 2 }} />
                <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "1rem" }}>
                  Aún no has realizado ninguna compra de productos.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(P.border, 0.85)}`, borderRadius: 2.5, overflow: "hidden" }}>
                  <Table aria-label="tabla de compras">
                    <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>FOLIO / ID</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>FECHA Y HORA</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>ARTÍCULOS</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>TOTAL</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>ESTADO</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: P.navy, fontSize: "0.82rem" }}>ACCIONES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comprasMostrar.map((compra) => {
                        const dateStr = compra.fecha ? new Date(compra.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—";
                        const timeStr = compra.fecha ? new Date(compra.fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "";

                        return (
                          <TableRow key={compra.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 800, color: P.primary, fontSize: "0.85rem", fontFamily: "monospace" }}>
                              #{compra.id}
                            </TableCell>
                            <TableCell sx={{ color: P.secondary, fontSize: "0.85rem", fontWeight: 650 }}>
                              {dateStr} {timeStr && <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>{timeStr}</Typography>}
                            </TableCell>
                            <TableCell sx={{ minWidth: 260 }}>
                              <Stack spacing={1}>
                                {(compra.items || []).map((item, idx) => (
                                  <Stack key={item.insumo_id || idx} direction="row" spacing={1.5} alignItems="center">
                                    <Box
                                      component="img"
                                      src={resolveServicioImagenUrl(item.imagen, api.defaults.baseURL)}
                                      alt={item.nombre}
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        objectFit: "contain",
                                        borderRadius: 1.5,
                                        bgcolor: "#F8FAFC",
                                        border: `1px solid ${alpha(P.border, 0.8)}`,
                                        p: 0.25,
                                        flexShrink: 0
                                      }}
                                    />
                                    <Typography sx={{ color: P.primary, fontSize: "0.82rem", fontWeight: 700 }}>
                                      {item.nombre} <Box component="span" sx={{ color: P.secondary, fontSize: "0.75rem", fontWeight: 650 }}>(x{item.cantidad})</Box>
                                    </Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 900, color: P.primary, fontSize: "0.88rem" }}>
                              {moneyMXN(compra.total)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<CheckCircleRounded sx={{ color: "#15803D !important", fontSize: "14px !important" }} />}
                                label="Aprobado"
                                size="small"
                                sx={{
                                  bgcolor: alpha("#15803D", 0.08),
                                  color: "#15803D",
                                  fontWeight: 800,
                                  fontSize: "0.72rem",
                                  border: `1px solid ${alpha("#15803D", 0.22)}`
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<ReplayRoundedIcon sx={{ fontSize: "14px !important" }} />}
                                  onClick={() => handleComprarDeNuevo(compra)}
                                  sx={{
                                    bgcolor: P.navy,
                                    fontWeight: 800,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    py: 0.5,
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#152a41" }
                                  }}
                                >
                                  Repetir
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<DownloadRoundedIcon sx={{ fontSize: "14px !important" }} />}
                                  onClick={() => descargarTicketInsumosPDF(compra)}
                                  sx={{
                                    borderColor: P.border,
                                    color: P.navy,
                                    fontWeight: 800,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    py: 0.5,
                                    borderRadius: 1.5,
                                    "&:hover": { borderColor: P.navy, bgcolor: "rgba(30, 58, 90, 0.04)" }
                                  }}
                                >
                                  PDF
                                </Button>
                                <Button
                                  variant="text"
                                  size="small"
                                  startIcon={<ReceiptLongRoundedIcon sx={{ fontSize: "14px !important" }} />}
                                  onClick={() => handleVerComprobanteCompra(compra)}
                                  sx={{
                                    color: P.secondary,
                                    fontWeight: 800,
                                    fontSize: "0.72rem",
                                    textTransform: "none",
                                    py: 0.5,
                                    "&:hover": { color: P.navy, bgcolor: "transparent" }
                                  }}
                                >
                                  Recibo
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {compras.length > 2 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button
                      variant="text"
                      onClick={() => setVerTodas(!verTodas)}
                      startIcon={verTodas ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />}
                      sx={{
                        color: P.navy,
                        fontWeight: 900,
                        textTransform: "none",
                        fontSize: "0.85rem",
                        "&:hover": { bgcolor: alpha(P.navy, 0.05) }
                      }}
                    >
                      {verTodas ? "Ver menos compras" : `Ver todas las compras (${compras.length})`}
                    </Button>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </GlassCard>
      </MotionBox>
    </AdminPageShell>
  );
}

export default MisComprasCliente;
