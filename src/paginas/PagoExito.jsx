import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";

const PagoExito = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
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

  return (
    <Box sx={{ p: 4, textAlign: "center", maxWidth: 500, mx: "auto", mt: 8 }}>
      <CheckCircleOutlineRoundedIcon sx={{ fontSize: 80, color: "#15803D", mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 900, color: P.navy, mb: 1 }}>
        ¡Pago Exitoso!
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        Tu pedido ha sido procesado correctamente y el stock ha sido actualizado.
        ¡Gracias por tu compra!
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/cliente/productos")}
        sx={{ bgcolor: P.navy, py: 1.5, fontWeight: 700, borderRadius: 2 }}
      >
        Volver a la tienda
      </Button>
    </Box>
  );
};

export default PagoExito;
