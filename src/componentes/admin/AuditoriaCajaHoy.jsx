import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { VisibilityRounded, PointOfSaleRounded } from "@mui/icons-material";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import api from "../../api";
import VentaDetalleModal from "./VentaDetalleModal";

export default function AuditoriaCajaHoy() {
  const [ventas, setVentas] = useState([]);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/auditoria/caja/hoy");
      setVentas(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total), 0);

  return (
    <Box sx={{ animation: "fadeIn 0.4s ease-in-out" }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: P.navy, fontFamily: '"Cinzel", ui-serif, Georgia, serif', letterSpacing: "-0.01em" }}>
            Auditoría de Caja (Hoy)
          </Typography>
          <Typography sx={{ color: P.secondary, mt: 0.5, fontWeight: 600 }}>
            Historial de ventas online concretadas durante el día actual.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: '0.9rem' }}>Ingresos Online Hoy</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#22C55E" }}>
            ${totalVentas.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <GlassCard elevation={0} sx={{ p: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 800, color: P.navy, borderBottom: `2px solid ${alpha(P.accent, 0.2)}` } }}>
              <TableCell>Folio</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto Total</TableCell>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell align="center">Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: P.secondary }}>Cargando ventas...</TableCell>
              </TableRow>
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: P.secondary }}>
                  <PointOfSaleRounded sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700 }}>No hay ventas online registradas el día de hoy.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((v) => (
                <TableRow key={v.id} sx={{ '&:hover': { bgcolor: alpha(P.cream, 0.3) }, transition: 'background 0.2s' }}>
                  <TableCell sx={{ fontWeight: 800 }}>#{v.id.toString().padStart(5, '0')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{v.comprador_nombre || "Desconocido"}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#15803D" }}>${Number(v.total).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: P.secondary, fontWeight: 500 }}>
                    {new Date(v.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => setSelectedVenta(v)} 
                      sx={{ 
                        color: P.navy, 
                        bgcolor: alpha(P.navy, 0.05),
                        '&:hover': { bgcolor: alpha(P.navy, 0.15) }
                      }}
                    >
                      <VisibilityRounded />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {selectedVenta && (
        <VentaDetalleModal
          ventaId={selectedVenta.id}
          onClose={() => setSelectedVenta(null)}
        />
      )}
    </Box>
  );
}
