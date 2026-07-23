import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import { Box, Typography, Button, CircularProgress, Paper, Divider, Stack, Alert } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import { descargarTicketInsumosPDF } from "../utils/ticketInsumosPDF";

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

const PagoExito = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const hasCalled = useRef(false); // guardia: solo confirmar UNA vez

  const pedidoId = searchParams.get("pedidoId");
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    if (hasCalled.current) return; // ya corrió, no volver a ejecutar
    hasCalled.current = true;

    const confirmarPago = async () => {
      try {
        if (pedidoId && paymentId) {
          await api.post("/api/mercado-pago/confirmar-pago", {
            pedidoId,
            mpPaymentId: paymentId,
            mpStatus: status
          });
          clearCart();

          // Cargar detalles de la compra para el ticket interactivo
          const { data } = await api.get(`/api/cliente/compras/${pedidoId}`);
          setPedido(data);
          
          // Descargar automáticamente el comprobante PDF para el cliente
          try {
            descargarTicketInsumosPDF(data);
          } catch (pdfErr) {
            console.error("Error al descargar ticket automático:", pdfErr);
          }
        }
      } catch (error) {
        console.error("Error confirmando pago:", error);
      } finally {
        setLoading(false);
      }
    };

    confirmarPago();
  }, [pedidoId, paymentId, status, clearCart]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: P.navy }} />
        <Typography sx={{ mt: 2, fontWeight: 700 }}>Confirmando tu pago...</Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    if (pedido) {
      descargarTicketInsumosPDF(pedido);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4, mb: 6 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <CheckCircleOutlineRoundedIcon sx={{ fontSize: 80, color: "#15803D", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 900, color: P.navy, mb: 1, fontFamily: '"Cinzel", serif' }}>
          ¡Compra Exitosa!
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
          Tu pago ha sido procesado de manera correcta. A continuación te presentamos tu ticket de compra.
        </Typography>
      </Box>

      {pedido && (
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            border: "1px dashed #CBD5E1",
            borderRadius: 4,
            bgcolor: "#F8FAFC",
            mb: 4,
            position: "relative"
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: P.navy, fontFamily: '"Cinzel", serif', letterSpacing: 0.5 }}>
              LADY BARBER SALÓN
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              COMPROBANTE DE COMPRA DE PRODUCTOS
            </Typography>
          </Box>

          <Divider sx={{ my: 2, borderStyle: "dashed" }} />

          <Stack spacing={1} sx={{ mb: 2.5, fontSize: "0.85rem", color: "text.secondary" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700 }}>Folio Pedido:</Typography>
              <Typography sx={{ fontWeight: 800, color: P.navy }}>#{pedido.id}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700 }}>Fecha:</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-MX", { dateStyle: "long" }) : "—"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700 }}>Transacción MP:</Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{pedido.mp_payment_id || "—"}</Typography>
            </Box>
          </Stack>

          <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 2.5, "& .MuiAlert-message": { fontSize: "0.85rem", fontWeight: 650, color: "#854D0E" } }}>
            📍 Con este comprobante deberás recoger tus productos de manera presencial en el local.
          </Alert>

          <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: P.navy, mb: 1.5 }}>
            DETALLE DE PRODUCTOS:
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {(pedido.items || []).map((item) => (
              <Box key={item.insumo_id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                  • {item.nombre} <Box component="span" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>(x{item.cantidad})</Box>
                </Typography>
                <Typography sx={{ fontWeight: 800, color: P.navy }}>
                  {moneyMXN(item.precio_unitario * item.cantidad)}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography sx={{ fontWeight: 900, color: P.navy, fontSize: "1rem" }}>Total Pagado:</Typography>
            <Typography sx={{ fontWeight: 900, color: "#15803D", fontSize: "1.25rem" }}>
              {moneyMXN(pedido.total)}
            </Typography>
          </Box>
        </Paper>
      )}

      <Stack spacing={2}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<DownloadRoundedIcon />}
          onClick={handlePrint}
          sx={{
            bgcolor: P.navy,
            py: 1.5,
            fontWeight: 800,
            borderRadius: 2.5,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(30, 58, 90, 0.2)",
            "&:hover": { bgcolor: "#152a41" }
          }}
        >
          Descargar Comprobante PDF
        </Button>
        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => navigate("/cliente/compras")}
          sx={{
            borderColor: P.border,
            color: P.navy,
            py: 1.5,
            fontWeight: 800,
            borderRadius: 2.5,
            textTransform: "none",
            "&:hover": { borderColor: P.navy, bgcolor: "rgba(30, 58, 90, 0.04)" }
          }}
        >
          Ver mis compras
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => navigate("/cliente")}
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", color: P.navy }
          }}
        >
          Volver al Inicio
        </Button>
      </Stack>
    </Box>
  );
};

export default PagoExito;
