import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { alpha } from "@mui/material/styles";
import api from "../../../api";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";

export default function VentaDetalleModal({ ventaId, onClose }) {
  const [venta, setVenta] = useState(null);

  useEffect(() => {
    if (ventaId) {
      api.get(`/api/auditoria/caja/detalle/${ventaId}`)
        .then(res => setVenta(res.data))
        .catch(console.error);
    }
  }, [ventaId]);

  if (!venta) return null;

  let detalles = [];
  try {
    detalles = JSON.parse(venta.detalle || "[]");
  } catch (e) {}

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: P.pageBg,
          color: P.navy,
          borderRadius: 3,
          boxShadow: `0 24px 48px ${alpha(P.navy, 0.2)}`,
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: P.navy, bgcolor: alpha(P.accent, 0.1) }}>
        Detalle de Venta Online #{venta.id}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: alpha(P.navy, 0.1) }}>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ color: P.secondary, fontWeight: 700, mb: 1 }}>Datos del Comprador</Typography>
          <Box sx={{ bgcolor: alpha(P.cream, 0.3), p: 2, borderRadius: 2, border: `1px solid ${alpha(P.accent, 0.2)}` }}>
            <Typography sx={{ fontWeight: 800 }}>Nombre: <span style={{ fontWeight: 500 }}>{venta.comprador_nombre || 'N/A'}</span></Typography>
            <Typography sx={{ fontWeight: 800 }}>Email: <span style={{ fontWeight: 500 }}>{venta.comprador_email || 'N/A'}</span></Typography>
            <Typography sx={{ fontWeight: 800 }}>Teléfono: <span style={{ fontWeight: 500 }}>{venta.comprador_telefono || 'N/A'}</span></Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ color: P.secondary, fontWeight: 700, mb: 1 }}>Productos Comprados</Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(P.navy, 0.05) }}>
              <TableCell sx={{ fontWeight: 800 }}>Producto ID</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Cant</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Precio</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles.map((d, idx) => (
              <TableRow key={idx}>
                <TableCell>{d.id}</TableCell>
                <TableCell align="center">{d.cantidad}</TableCell>
                <TableCell align="right">${Number(d.precioVenta || 0).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>${(Number(d.cantidad) * Number(d.precioVenta || 0)).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: P.navy }}>Total Pagado</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#22C55E" }}>
            ${Number(venta.total).toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: alpha(P.navy, 0.02) }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: P.navy, color: '#fff', '&:hover': { bgcolor: '#152a41' }, borderRadius: 2, px: 4 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
