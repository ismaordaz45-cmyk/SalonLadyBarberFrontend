import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { motion, AnimatePresence } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import api from "../../../api";

// ─────────────────────────────────────────────────────────────
// PALETA DE COLORES ELEGANTE (Matching Lady Barber Theme)
// ─────────────────────────────────────────────────────────────
const PALETTE = {
  card: "#FFFFFF",
  primary: "#1E293B",
  secondary: "#64748B",
  border: "#E2E8F0",
  gold: "#D4AF38",
  navy: "#1E3A5F",
  green: "#10B981",
  blue: "#3B82F6",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  creamBg: "#F8FAFC"
};

const GlassCard = styled(Card)(() => ({
  background: `linear-gradient(145deg, ${PALETTE.card} 0%, #F1F5F9 100%)`,
  borderRadius: 18,
  border: `1px solid ${PALETTE.border}`,
  boxShadow: `0 8px 24px ${alpha(PALETTE.navy, 0.06)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: `0 12px 32px ${alpha(PALETTE.navy, 0.12)}`,
    borderColor: alpha(PALETTE.gold, 0.3)
  }
}));

const StatCard = styled(motion.div)(({ accentcolor = PALETTE.gold }) => ({
  background: PALETTE.card,
  borderRadius: 16,
  border: `1px solid ${PALETTE.border}`,
  padding: "20px 24px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: alpha(accentcolor, 0.4),
    boxShadow: `0 8px 24px ${alpha(accentcolor, 0.12)}`,
    transform: "translateY(-2px)"
  }
}));

export default function SegmentacionClientes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataPayload, setDataPayload] = useState(null);

  // Estado del Modal para clasificar nuevo cliente
  const [openModal, setOpenModal] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState("");
  const [simResult, setSimResult] = useState(null);

  const [formSim, setFormSim] = useState({
    nombre_cliente: "",
    n_citas: 5,
    gasto_total: 1000,
    servicio_mas_frecuente: "Corte de Cabello",
    dias_ultima_visita: 15
  });

  const fetchSegmentos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/prediccion/segmentacion-clientes", { timeout: 25000 });
      setDataPayload(res.data || null);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "No se pudo cargar la segmentación de clientes desde el servicio ML."
      );
      setDataPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegmentos();
  }, [fetchSegmentos]);

  const clientesList = useMemo(() => {
    if (!dataPayload) return [];
    if (Array.isArray(dataPayload.clientes)) return dataPayload.clientes;
    if (Array.isArray(dataPayload)) return dataPayload;
    return [];
  }, [dataPayload]);

  // Agrupación por cluster
  const conteoClusters = useMemo(() => {
    const counts = { vip: 0, ocasional: 0, riesgo: 0 };
    clientesList.forEach((c) => {
      const nombre = (c.nombre_segmento || "").toLowerCase();
      if (nombre.includes("vip") || nombre.includes("frecuente")) {
        counts.vip += 1;
      } else if (nombre.includes("riesgo") || nombre.includes("inactivo") || nombre.includes("fuga")) {
        counts.riesgo += 1;
      } else {
        counts.ocasional += 1;
      }
    });
    return counts;
  }, [clientesList]);

  // Datos para la gráfica Doughnut
  const doughnutData = useMemo(() => {
    return {
      labels: ["Clientes VIP / Frecuentes", "Clientes Ocasionales", "En Riesgo de Fuga"],
      datasets: [
        {
          data: [conteoClusters.vip, conteoClusters.ocasional, conteoClusters.riesgo],
          backgroundColor: [PALETTE.gold, PALETTE.blue, PALETTE.red],
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }
      ]
    };
  }, [conteoClusters]);

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSimLoading(true);
      setSimError("");
      setSimResult(null);

      const payload = {
        nombre_cliente: formSim.nombre_cliente || "Cliente Simulado",
        n_citas: Number(formSim.n_citas),
        gasto_total: Number(formSim.gasto_total),
        servicio_mas_frecuente: formSim.servicio_mas_frecuente,
        dias_ultima_visita: Number(formSim.dias_ultima_visita)
      };

      const res = await api.post("/api/prediccion/segmentar-cliente", payload, { timeout: 25000 });
      setSimResult(res.data);
    } catch (err) {
      setSimError(err?.response?.data?.error || "Error al clasificar cliente.");
    } finally {
      setSimLoading(false);
    }
  };

  const getChipStyle = (segmentoNombre = "") => {
    const str = segmentoNombre.toLowerCase();
    if (str.includes("vip") || str.includes("frecuente")) {
      return { label: segmentoNombre, color: "warning", icon: <StarRoundedIcon sx={{ fontSize: 16 }} /> };
    } else if (str.includes("riesgo") || str.includes("inactivo") || str.includes("fuga")) {
      return { label: segmentoNombre, color: "error", icon: <WarningRoundedIcon sx={{ fontSize: 16 }} /> };
    } else {
      return { label: segmentoNombre, color: "primary", icon: <GroupsRoundedIcon sx={{ fontSize: 16 }} /> };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: PALETTE.creamBg, minHeight: "100vh" }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: PALETTE.navy, display: "flex", alignItems: "center", gap: 1 }}>
            <CategoryRoundedIcon sx={{ color: PALETTE.gold, fontSize: 32 }} />
            Segmentación Inteligente de Clientes (K-Means)
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.secondary, mt: 0.5 }}>
            Agrupamiento por comportamiento de consumo, frecuencia y días de recesión
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ReplayRoundedIcon />}
            onClick={fetchSegmentos}
            disabled={loading}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddRoundedIcon />}
            onClick={() => {
              setOpenModal(true);
              setSimResult(null);
              setSimError("");
            }}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              backgroundColor: PALETTE.navy,
              "&:hover": { backgroundColor: "#0F2942" }
            }}
          >
            Clasificar Cliente
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
          <CircularProgress size={48} sx={{ color: PALETTE.gold, mb: 2 }} />
          <Typography variant="body1" sx={{ color: PALETTE.secondary, fontWeight: 600 }}>
            Conectando con el microservicio ML y procesando segmentos...
          </Typography>
        </Box>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Cards de resumen */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard accentcolor={PALETTE.navy}>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                    Total Clientes Analizados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: PALETTE.navy, my: 0.5 }}>
                    {clientesList.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary }}>
                    Con citas completadas en BD
                  </Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard accentcolor={PALETTE.gold}>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                    Clientes VIP / Frecuentes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: PALETTE.gold, my: 0.5 }}>
                    {conteoClusters.vip}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PALETTE.green }}>
                    Alto gasto y asistencia frecuente
                  </Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard accentcolor={PALETTE.blue}>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                    Clientes Ocasionales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: PALETTE.blue, my: 0.5 }}>
                    {conteoClusters.ocasional}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary }}>
                    Asistencia periódica regular
                  </Typography>
                </StatCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard accentcolor={PALETTE.red}>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary, fontWeight: 700, textTransform: "uppercase" }}>
                    En Riesgo de Fuga
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: PALETTE.red, my: 0.5 }}>
                    {conteoClusters.riesgo}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PALETTE.red }}>
                    Requieren campaña de retención
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>

            {/* Gráfica + Tabla */}
            <Grid container spacing={3}>
              {/* Gráfica de Distribución */}
              <Grid item xs={12} md={4}>
                <GlassCard sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.navy, mb: 2, textAlign: "center" }}>
                    Distribución de Clientes por Segmento
                  </Typography>
                  <Box sx={{ width: "100%", height: 240, position: "relative" }}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom" }
                        }
                      }}
                    />
                  </Box>
                </GlassCard>
              </Grid>

              {/* Tabla de Clientes Segmentados */}
              <Grid item xs={12} md={8}>
                <GlassCard sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.navy, p: 1 }}>
                    Detalle de Clientes y Segmento Asignado
                  </Typography>

                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${PALETTE.border}`, borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: alpha(PALETTE.navy, 0.04) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>ID / Cliente</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800 }}>N° Citas (X1)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800 }}>Gasto Total (X2)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800 }}>Días Inactivo (X4)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800 }}>Segmento Asignado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clientesList.map((c, idx) => {
                          const chipObj = getChipStyle(c.nombre_segmento);
                          return (
                            <TableRow key={c.clienteId || idx} hover>
                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PALETTE.navy }}>
                                  {c.nombre_cliente}
                                </Typography>
                                <Typography variant="caption" sx={{ color: PALETTE.secondary }}>
                                  ID: #{c.clienteId}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">{c.n_citas}</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>
                                ${Number(c.gasto_total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" sx={{ color: c.dias_ultima_visita > 45 ? PALETTE.red : PALETTE.primary }}>
                                  {c.dias_ultima_visita} días
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  icon={chipObj.icon}
                                  label={chipObj.label}
                                  color={chipObj.color}
                                  size="small"
                                  sx={{ fontWeight: 700, borderRadius: 2 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </GlassCard>
              </Grid>
            </Grid>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal de Simulación / Clasificación de Cliente */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSimulateSubmit}>
          <DialogTitle sx={{ fontWeight: 800, color: PALETTE.navy }}>
            Clasificar Cliente en Tiempo Real
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nombre del Cliente (Opcional)"
                fullWidth
                size="small"
                value={formSim.nombre_cliente}
                onChange={(e) => setFormSim({ ...formSim, nombre_cliente: e.target.value })}
              />
              <TextField
                label="N° de Citas Completadas (X1)"
                type="number"
                fullWidth
                size="small"
                required
                value={formSim.n_citas}
                onChange={(e) => setFormSim({ ...formSim, n_citas: e.target.value })}
              />
              <TextField
                label="Gasto Total Acumulado $ (X2)"
                type="number"
                fullWidth
                size="small"
                required
                value={formSim.gasto_total}
                onChange={(e) => setFormSim({ ...formSim, gasto_total: e.target.value })}
              />
              <TextField
                label="Servicio Más Frecuente (X3)"
                select
                fullWidth
                size="small"
                value={formSim.servicio_mas_frecuente}
                onChange={(e) => setFormSim({ ...formSim, servicio_mas_frecuente: e.target.value })}
              >
                <MenuItem value="Corte de Cabello">Corte de Cabello</MenuItem>
                <MenuItem value="Barba">Barba</MenuItem>
                <MenuItem value="Corte+Barba">Corte + Barba</MenuItem>
                <MenuItem value="Tinte">Tinte</MenuItem>
                <MenuItem value="Manicure">Manicure</MenuItem>
                <MenuItem value="Sin registro">Sin registro</MenuItem>
              </TextField>
              <TextField
                label="Días desde Última Visita (X4)"
                type="number"
                fullWidth
                size="small"
                required
                value={formSim.dias_ultima_visita}
                onChange={(e) => setFormSim({ ...formSim, dias_ultima_visita: e.target.value })}
              />

              {simError && <Alert severity="error">{simError}</Alert>}

              {simResult && (
                <Box sx={{ p: 2, bgcolor: alpha(PALETTE.gold, 0.1), borderRadius: 3, border: `1px solid ${PALETTE.gold}` }}>
                  <Typography variant="caption" sx={{ color: PALETTE.secondary, textTransform: "uppercase", fontWeight: 700 }}>
                    Resultado del Modelo K-Means:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.navy, mt: 0.5 }}>
                    {simResult.nombre_segmento}
                  </Typography>
                  <Typography variant="body2" sx={{ color: PALETTE.secondary }}>
                    Cluster ID: #{simResult.cluster}
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: "none" }}>
              Cerrar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={simLoading}
              sx={{ textTransform: "none", fontWeight: 800, backgroundColor: PALETTE.navy }}
            >
              {simLoading ? <CircularProgress size={24} /> : "Evaluar Modelo"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
