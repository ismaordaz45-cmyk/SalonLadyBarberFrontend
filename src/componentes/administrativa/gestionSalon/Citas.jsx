// ============================================
// COMPONENTE: Citas.jsx (Gestión del Salón - PROPIETARIA)
// Monitorea citas pendientes e historial de la barbería
// Tabla: cita (id, clienteId, empleadaId, fecha, horaInicio, horaFin, estado, notas, precioFinal, creadoEn, actualizadoEn)
// Estados: APARTADA | CONFIRMADA | EN_PROCESO | COMPLETADA | CANCELADA | NO_ASISTIO
// ============================================

import React, { useState, useEffect } from "react";
import api from "../../../api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

// Estados que se consideran "pendientes"
const ESTADOS_PENDIENTES = ["APARTADA", "CONFIRMADA", "EN_PROCESO"];
// Estados que se consideran "historial"
const ESTADOS_HISTORIAL = ["COMPLETADA", "CANCELADA", "NO_ASISTIO"];

const COLOR_ESTADO = {
  APARTADA: { bg: alpha("#D4AF37", 0.15), color: "#B8860B" },
  CONFIRMADA: { bg: alpha("#22C55E", 0.15), color: "#15803D" },
  EN_PROCESO: { bg: alpha("#3B82F6", 0.15), color: "#1D4ED8" },
  COMPLETADA: { bg: alpha("#22C55E", 0.15), color: "#15803D" },
  CANCELADA: { bg: alpha("#F97373", 0.15), color: "#B91C1C" },
  NO_ASISTIO: { bg: alpha("#F59E0B", 0.15), color: "#B45309" }
};

const LABEL_ESTADO = {
  APARTADA: "Apartada",
  CONFIRMADA: "Confirmada",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió"
};

// Formatear fecha para mostrar
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
};

const formatearHora = (fechaStr) => {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const formatearPrecio = (valor) => {
  if (valor == null || valor === "") return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(valor));
};

const MySwal = withReactContent(Swal);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Citas() {
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [tabActiva, setTabActiva] = useState(0);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const fetchCitas = async () => {
    setLoadingCitas(true);
    try {
      const { data } = await api.get("/api/citas");
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudieron cargar las citas",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha(PALETA.acento, 0.15),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const citasPendientes = citas.filter((c) =>
    ESTADOS_PENDIENTES.includes(c.estado)
  );
  const citasHistorial = citas.filter((c) =>
    ESTADOS_HISTORIAL.includes(c.estado)
  );

  const filtrarCitas = (lista) => {
    return lista.filter((c) => {
      const coincideTexto =
        !filtroTexto ||
        c.clienteNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        c.empleadaNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (c.notas && c.notas.toLowerCase().includes(filtroTexto.toLowerCase()));
      const coincideFecha =
        !filtroFecha ||
        (c.fecha && c.fecha.startsWith(filtroFecha));
      return coincideTexto && coincideFecha;
    });
  };

  const pendientesFiltradas = filtrarCitas(citasPendientes);
  const historialFiltrado = filtrarCitas(citasHistorial);

  const handleCambiarTab = (event, nuevoValor) => {
    setTabActiva(nuevoValor);
  };

  const renderChipEstado = (estado) => {
    const config = COLOR_ESTADO[estado] || { bg: "#eee", color: "#333" };
    return (
      <Chip
        size="small"
        label={LABEL_ESTADO[estado] || estado}
        sx={{
          bgcolor: config.bg,
          color: config.color,
          fontWeight: 600,
          fontSize: "0.75rem"
        }}
      />
    );
  };

  const renderTablaPendientes = () => (
    <TableContainer>
      <Table size="medium" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.08) }}>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Cliente
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Empleada
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Fecha / Hora
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Estado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Precio
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendientesFiltradas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                <EventAvailableRoundedIcon
                  sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No hay citas pendientes
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pendientesFiltradas.map((cita) => (
              <TableRow
                key={cita.id}
                sx={{
                  "&:hover": { bgcolor: PALETA.fondoIcono(0.04) }
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutlineRoundedIcon
                      sx={{ fontSize: 20, color: PALETA.borde(0.6) }}
                    />
                    {cita.clienteNombre || `Cliente #${cita.clienteId}`}
                  </Box>
                </TableCell>
                <TableCell>{cita.empleadaNombre || `Empleada #${cita.empleadaId}`}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFecha(cita.fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearHora(cita.horaInicio)} – {formatearHora(cita.horaFin)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{renderChipEstado(cita.estado)}</TableCell>
                <TableCell>{formatearPrecio(cita.precioFinal)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: PALETA.principal }}
                    title="Ver detalle"
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTablaHistorial = () => (
    <TableContainer>
      <Table size="medium" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.08) }}>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Cliente
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Empleada
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Fecha / Hora
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Estado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Precio
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Notas
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historialFiltrado.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
                <HistoryRoundedIcon
                  sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No hay citas en el historial
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            historialFiltrado.map((cita) => (
              <TableRow
                key={cita.id}
                sx={{
                  "&:hover": { bgcolor: PALETA.fondoIcono(0.04) },
                  opacity: cita.estado === "CANCELADA" || cita.estado === "NO_ASISTIO" ? 0.85 : 1
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutlineRoundedIcon
                      sx={{ fontSize: 20, color: PALETA.borde(0.6) }}
                    />
                    {cita.clienteNombre || `Cliente #${cita.clienteId}`}
                  </Box>
                </TableCell>
                <TableCell>{cita.empleadaNombre || `Empleada #${cita.empleadaId}`}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFecha(cita.fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearHora(cita.horaInicio)} – {formatearHora(cita.horaFin)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{renderChipEstado(cita.estado)}</TableCell>
                <TableCell>{formatearPrecio(cita.precioFinal)}</TableCell>
                <TableCell sx={{ maxWidth: 160 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {cita.notas || "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: PALETA.principal }}
                    title="Ver detalle"
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loadingCitas) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          py: 5,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress sx={{ color: PALETA.acento }} size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        {/* ========== TÍTULO PÁGINA ========== */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: PALETA.fondoIcono()
            }}
          >
            <EventAvailableRoundedIcon sx={{ color: PALETA.principal, fontSize: 30 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}
            >
              Gestión de citas
            </Typography>
            <Typography variant="body2" sx={{ color: PALETA.borde(0.8), mt: 0.5 }}>
              Monitorea las citas pendientes y el historial de la barbería.
            </Typography>
          </Box>
        </Box>

        {/* ========== RESUMEN RÁPIDO ========== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2,
                bgcolor: alpha("#D4AF37", 0.06)
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#D4AF37", 0.2)
                  }}
                >
                  <CalendarMonthRoundedIcon sx={{ color: PALETA.acento, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pendientes hoy
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {citasPendientes.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: PALETA.fondoIcono()
                  }}
                >
                  <ScheduleRoundedIcon sx={{ color: PALETA.principal, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    En proceso
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {citasPendientes.filter((c) => c.estado === "EN_PROCESO").length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#22C55E", 0.1)
                  }}
                >
                  <PaidRoundedIcon sx={{ color: "#15803D", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total historial
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {citasHistorial.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ========== PESTAÑAS Y FILTROS ========== */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2,
            overflow: "hidden"
          }}
        >
          <Tabs
            value={tabActiva}
            onChange={handleCambiarTab}
            sx={{
              borderBottom: `1px solid ${PALETA.borde()}`,
              bgcolor: PALETA.fondoIcono(0.04),
              "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
              "& .Mui-selected": { color: PALETA.acento }
            }}
          >
            <Tab
              icon={<EventAvailableRoundedIcon />}
              iconPosition="start"
              label={`Pendientes (${citasPendientes.length})`}
            />
            <Tab
              icon={<HistoryRoundedIcon />}
              iconPosition="start"
              label={`Historial (${citasHistorial.length})`}
            />
          </Tabs>

          <Box sx={{ p: 2, borderBottom: `1px solid ${PALETA.borde(0.06)}` }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center"
              }}
            >
              <TextField
                size="small"
                placeholder="Buscar por cliente, empleada o notas..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                sx={{
                  minWidth: 260,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff"
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: PALETA.borde(0.6) }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                size="small"
                type="date"
                label="Filtrar por fecha"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 180,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff"
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 0 }}>
            {tabActiva === 0 ? renderTablaPendientes() : renderTablaHistorial()}
          </Box>
        </Paper>

      </Container>
    </Box>
  );
}

export default Citas;
